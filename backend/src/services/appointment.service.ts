import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { ConflictError, NotFoundError, ForbiddenError, AppError } from '../lib/errors'
import { emailService } from './email.service'
import type { CreateAppointmentDto, AppointmentQuery } from '../schemas/appointment.schema'

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60).toString().padStart(2, '0')
  const m = (mins % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

export async function create(data: CreateAppointmentDto, customerId: string) {
  const service = await prisma.service.findFirst({
    where: { id: data.serviceId, businessId: data.businessId, isActive: true },
  })
  if (!service) throw new NotFoundError('Hizmet bulunamadı')

  const endTime = minutesToTime(timeToMinutes(data.startTime) + service.duration)

  const appointment = await prisma.$transaction(async (tx) => {
    const existing = await tx.$queryRaw<{ id: string }[]>(
      Prisma.sql`
        SELECT id FROM "Appointment"
        WHERE "staffId" = ${data.staffId}
          AND "appointmentDate" = ${new Date(data.appointmentDate)}::date
          AND "startTime" < ${endTime}
          AND "endTime" > ${data.startTime}
          AND status::text IN ('pending','confirmed','started')
        FOR UPDATE
      `
    )

    if (existing.length > 0) throw new ConflictError('Bu saat başka bir randevuyla çakışıyor')

    return tx.appointment.create({
      data: {
        businessId: data.businessId,
        customerId,
        serviceId: data.serviceId,
        staffId: data.staffId,
        appointmentDate: new Date(data.appointmentDate),
        startTime: data.startTime,
        endTime,
        totalPrice: service.price,
        customerNotes: data.customerNotes,
      },
      include: {
        business: { select: { name: true, address: true, phone: true } },
        service: { select: { name: true, duration: true } },
        staff: { select: { name: true } },
        customer: { select: { firstName: true, lastName: true, email: true } },
      },
    })
  })

  try {
    await emailService.sendAppointmentConfirmation(appointment.customer.email, {
      customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
      businessName: appointment.business.name,
      serviceName: appointment.service.name,
      staffName: appointment.staff.name,
      date: data.appointmentDate,
      startTime: data.startTime,
      endTime,
      price: Number(service.price),
    })
  } catch {
    // Email hatası randevu oluşturmayı engellememeli
  }

  return appointment
}

export async function getAll(query: AppointmentQuery, userId: string, userRole: string) {
  const { status, page, limit, businessId, fromDate, toDate } = query

  let where: Prisma.AppointmentWhereInput = {}

  if (userRole === 'customer') {
    where.customerId = userId
  } else if (userRole === 'business_owner') {
    const business = await prisma.business.findFirst({ where: { ownerId: userId } })
    where.businessId = business?.id
  } else if (userRole === 'staff') {
    const staff = await prisma.staff.findFirst({ where: { userId } })
    where.staffId = staff?.id
  }

  if (status) where.status = status
  if (businessId && userRole === 'admin') where.businessId = businessId
  if (fromDate) where.appointmentDate = { ...((where.appointmentDate as object) || {}), gte: new Date(fromDate) }
  if (toDate) where.appointmentDate = { ...((where.appointmentDate as object) || {}), lte: new Date(toDate) }

  const [items, total] = await Promise.all([
    prisma.appointment.findMany({
      where,
      include: {
        business: { select: { name: true, slug: true, logo: true } },
        service: { select: { name: true, duration: true } },
        staff: { select: { name: true, avatar: true } },
        customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
        payment: { select: { status: true, amount: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: [{ appointmentDate: 'desc' }, { startTime: 'desc' }],
    }),
    prisma.appointment.count({ where }),
  ])

  return { items, meta: { total, page, limit } }
}

export async function getById(id: string, userId: string, userRole: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      business: { select: { name: true, address: true, phone: true, slug: true } },
      service: true,
      staff: { select: { name: true, avatar: true } },
      customer: { select: { firstName: true, lastName: true, email: true, phone: true } },
      payment: true,
    },
  })

  if (!appointment) throw new NotFoundError('Randevu bulunamadı')

  if (userRole === 'customer' && appointment.customerId !== userId) throw new ForbiddenError()
  if (userRole === 'business_owner') {
    const owns = await prisma.business.findFirst({ where: { id: appointment.businessId, ownerId: userId } })
    if (!owns) throw new ForbiddenError()
  }

  return appointment
}

async function assertBusinessOwner(businessId: string, userId: string) {
  const business = await prisma.business.findFirst({ where: { id: businessId, ownerId: userId } })
  if (!business) throw new ForbiddenError('Bu randevu üzerinde yetkiniz yok')
}

export async function confirm(id: string, userId: string) {
  const apt = await prisma.appointment.findUnique({ where: { id } })
  if (!apt) throw new NotFoundError('Randevu bulunamadı')
  if (apt.status !== 'pending') throw new AppError('Sadece bekleyen randevular onaylanabilir', 400, 'INVALID_STATUS')
  await assertBusinessOwner(apt.businessId, userId)
  return prisma.appointment.update({ where: { id }, data: { status: 'confirmed' } })
}

export async function start(id: string, userId: string, userRole: string) {
  const apt = await prisma.appointment.findUnique({ where: { id } })
  if (!apt) throw new NotFoundError('Randevu bulunamadı')
  if (apt.status !== 'confirmed') throw new AppError('Sadece onaylanan randevular başlatılabilir', 400, 'INVALID_STATUS')
  if (userRole === 'business_owner') await assertBusinessOwner(apt.businessId, userId)
  return prisma.appointment.update({ where: { id }, data: { status: 'started' } })
}

export async function complete(id: string, userId: string, userRole: string) {
  const apt = await prisma.appointment.findUnique({ where: { id } })
  if (!apt) throw new NotFoundError('Randevu bulunamadı')
  if (apt.status !== 'started') throw new AppError('Sadece başlayan randevular tamamlanabilir', 400, 'INVALID_STATUS')
  if (userRole === 'business_owner') await assertBusinessOwner(apt.businessId, userId)

  const updated = await prisma.appointment.update({ where: { id }, data: { status: 'completed' } })

  // Sadakat puanı
  await prisma.loyaltyPoint.create({
    data: {
      customerId: apt.customerId,
      points: 10,
      source: 'appointment',
      referenceId: id,
      description: 'Tamamlanan randevu',
    },
  }).catch(() => { /* hata kritik değil */ })

  return updated
}

export async function cancel(id: string, userId: string, userRole: string, reason?: string) {
  const apt = await prisma.appointment.findUnique({
    where: { id },
    include: { business: { include: { cancellationPolicy: true } }, payment: true },
  })
  if (!apt) throw new NotFoundError('Randevu bulunamadı')

  if (!['pending', 'confirmed'].includes(apt.status)) {
    throw new AppError('Bu randevu iptal edilemez', 400, 'INVALID_STATUS')
  }

  // Müşteri iptali için zaman kontrolü
  if (userRole === 'customer') {
    if (apt.customerId !== userId) throw new ForbiddenError()
    const policy = apt.business.cancellationPolicy
    if (policy) {
      const aptDateTime = new Date(`${apt.appointmentDate.toISOString().split('T')[0]}T${apt.startTime}:00Z`)
      const hoursUntil = (aptDateTime.getTime() - Date.now()) / 3600000
      if (hoursUntil < policy.hoursBeforeAppointment) {
        throw new AppError(
          `İptal son ${policy.hoursBeforeAppointment} saat içinde yapılamaz`,
          400,
          'CANCELLATION_NOT_ALLOWED',
        )
      }
    }
  }

  const cancelledByBusiness = ['business_owner', 'admin', 'staff'].includes(userRole)
  const status = cancelledByBusiness ? 'cancelled_by_business' : 'cancelled_by_customer'

  const updated = await prisma.appointment.update({
    where: { id },
    data: { status, cancellationReason: reason, cancelledAt: new Date(), cancelledById: userId },
  })

  // Ödeme varsa iade
  if (apt.payment?.status === 'completed') {
    await prisma.payment.update({
      where: { id: apt.payment.id },
      data: { status: 'refunded', refundReason: reason, refundedAt: new Date(), refundAmount: apt.payment.amount },
    })
  }

  return updated
}

export async function markNoShow(id: string, userId: string) {
  const apt = await prisma.appointment.findUnique({ where: { id } })
  if (!apt) throw new NotFoundError('Randevu bulunamadı')
  if (apt.status !== 'confirmed') throw new AppError('Sadece onaylı randevular no-show yapılabilir', 400, 'INVALID_STATUS')
  await assertBusinessOwner(apt.businessId, userId)
  return prisma.appointment.update({ where: { id }, data: { status: 'no_show' } })
}
