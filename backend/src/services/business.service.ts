import { prisma } from '../lib/prisma'
import { getCache, setCache, deleteCache } from '../lib/redis'
import { NotFoundError, ForbiddenError } from '../lib/errors'
import type { CreateBusinessDto, UpdateBusinessDto, BusinessQuery } from '../schemas/business.schema'

const CACHE_TTL = 300 // 5 dakika

function slugify(text: string): string {
  const map: Record<string, string> = {
    ş: 's', ğ: 'g', ü: 'u', ö: 'o', ı: 'i', ç: 'c',
    Ş: 's', Ğ: 'g', Ü: 'u', Ö: 'o', İ: 'i', Ç: 'c',
  }
  return text
    .replace(/[şğüöıçŞĞÜÖİÇ]/g, (c) => map[c] || c)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function randomHex(len = 6): string {
  return Math.random().toString(16).slice(2, 2 + len)
}

export async function create(data: CreateBusinessDto, ownerId: string) {
  const slug = `${slugify(data.name)}-${randomHex()}`

  const business = await prisma.business.create({
    data: {
      ownerId,
      name: data.name,
      slug,
      categoryId: data.categoryId,
      description: data.description,
      address: data.address,
      city: data.city,
      phone: data.phone,
      email: data.email,
      website: data.website,
      cancellationPolicy: {
        create: {
          hoursBeforeAppointment: 24,
          refundPercentage: 100,
        },
      },
    },
    include: { category: true, cancellationPolicy: true },
  })

  await deleteCache('businesses:list:*')
  return business
}

export async function getAll(query: BusinessQuery) {
  const { categoryId, city, search, page, limit, status } = query
  const cacheKey = `businesses:list:${JSON.stringify(query)}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const where: Record<string, unknown> = {
    status: status || 'active',
    ...(categoryId ? { categoryId } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' } } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: { category: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { ratingAverage: 'desc' },
    }),
    prisma.business.count({ where }),
  ])

  const result = { items, meta: { total, page, limit } }
  await setCache(cacheKey, result, CACHE_TTL)
  return result
}

export async function getBySlug(slug: string) {
  const cacheKey = `businesses:slug:${slug}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const business = await prisma.business.findUnique({
    where: { slug },
    include: {
      category: true,
      businessHours: { orderBy: { dayOfWeek: 'asc' } },
      services: {
        where: { isActive: true },
        include: { category: true },
        orderBy: { name: 'asc' },
      },
      staff: {
        where: { isActive: true },
        include: { workingHours: { orderBy: { dayOfWeek: 'asc' } } },
        orderBy: { name: 'asc' },
      },
      cancellationPolicy: true,
      reviews: {
        where: { isVisible: true },
        include: { customer: { select: { firstName: true, lastName: true, avatar: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!business) throw new NotFoundError('İşletme bulunamadı')

  await setCache(cacheKey, business, CACHE_TTL)
  return business
}

export async function getById(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: {
      category: true,
      businessHours: { orderBy: { dayOfWeek: 'asc' } },
      services: { where: { isActive: true } },
      staff: { where: { isActive: true } },
      cancellationPolicy: true,
    },
  })
  if (!business) throw new NotFoundError('İşletme bulunamadı')
  return business
}

export async function update(id: string, data: UpdateBusinessDto, userId: string, userRole: string) {
  const business = await prisma.business.findUnique({ where: { id } })
  if (!business) throw new NotFoundError('İşletme bulunamadı')

  if (userRole !== 'admin' && business.ownerId !== userId) {
    throw new ForbiddenError('Bu işletmeyi düzenleme yetkiniz yok')
  }

  const updated = await prisma.business.update({
    where: { id },
    data,
    include: { category: true },
  })

  await deleteCache(`businesses:slug:${business.slug}`)
  await deleteCache('businesses:list:*')
  return updated
}

export async function updateHours(businessId: string, hours: { dayOfWeek: number; isOpen: boolean; openTime: string; closeTime: string; breakStart?: string; breakEnd?: string }[], userId: string) {
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) throw new NotFoundError('İşletme bulunamadı')
  if (business.ownerId !== userId) throw new ForbiddenError()

  await prisma.businessHour.deleteMany({ where: { businessId } })
  const created = await prisma.businessHour.createMany({
    data: hours.map((h) => ({ ...h, businessId })),
  })

  await deleteCache(`businesses:slug:${business.slug}`)
  return created
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function getAvailableSlots(
  businessId: string,
  serviceId: string,
  date: string,
  staffId?: string,
) {
  const cacheKey = `slots:${businessId}:${serviceId}:${date}:${staffId || 'any'}`
  const cached = await getCache(cacheKey)
  if (cached) return cached

  const service = await prisma.service.findFirst({
    where: { id: serviceId, businessId, isActive: true },
  })
  if (!service) throw new NotFoundError('Hizmet bulunamadı')

  const duration = service.duration
  const dayOfWeek = new Date(date).getDay()

  const staffList = staffId
    ? await prisma.staff.findMany({ where: { id: staffId, businessId, isActive: true }, include: { workingHours: true } })
    : await prisma.staff.findMany({ where: { businessId, isActive: true }, include: { workingHours: true } })

  const businessHour = await prisma.businessHour.findFirst({
    where: { businessId, dayOfWeek },
  })

  const now = new Date()
  const isToday = date === now.toISOString().split('T')[0]
  const currentMins = isToday ? now.getHours() * 60 + now.getMinutes() : 0

  const slots: { startTime: string; endTime: string; staffId: string; staffName: string }[] = []

  for (const staff of staffList) {
    const wh = staff.workingHours.find((w) => w.dayOfWeek === dayOfWeek)
    let start: number
    let end: number
    let breakStart: number | null = null
    let breakEnd: number | null = null

    if (wh) {
      if (!wh.isAvailable) continue
      start = timeToMinutes(wh.startTime)
      end = timeToMinutes(wh.endTime)
      if (wh.breakStart) breakStart = timeToMinutes(wh.breakStart)
      if (wh.breakEnd) breakEnd = timeToMinutes(wh.breakEnd)
    } else if (businessHour) {
      if (!businessHour.isOpen) continue
      start = timeToMinutes(businessHour.openTime)
      end = timeToMinutes(businessHour.closeTime)
      if (businessHour.breakStart) breakStart = timeToMinutes(businessHour.breakStart)
      if (businessHour.breakEnd) breakEnd = timeToMinutes(businessHour.breakEnd)
    } else {
      continue
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        staffId: staff.id,
        appointmentDate: new Date(date),
        status: { in: ['pending', 'confirmed', 'started'] },
      },
    })

    for (let slotStart = start; slotStart + duration <= end; slotStart += 30) {
      const slotEnd = slotStart + duration

      if (isToday && slotStart <= currentMins) continue

      if (breakStart !== null && breakEnd !== null) {
        if (slotStart < breakEnd && slotEnd > breakStart) continue
      }

      const hasConflict = appointments.some((a) => {
        const aStart = timeToMinutes(a.startTime)
        const aEnd = timeToMinutes(a.endTime)
        return slotStart < aEnd && slotEnd > aStart
      })

      if (!hasConflict) {
        slots.push({
          startTime: minutesToTime(slotStart),
          endTime: minutesToTime(slotEnd),
          staffId: staff.id,
          staffName: staff.name,
        })
      }
    }
  }

  const result = { slots }
  await setCache(cacheKey, result, 60)
  return result
}
