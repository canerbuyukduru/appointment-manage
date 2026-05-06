import { prisma } from '../lib/prisma'
import { NotFoundError } from '../lib/errors'
import { emailService } from './email.service'
import type { BusinessQuery } from '../schemas/business.schema'

export async function getBusinesses(query: BusinessQuery) {
  const { categoryId, city, search, page, limit, status } = query

  const where = {
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(city ? { city: { contains: city, mode: 'insensitive' as const } } : {}),
    ...(search
      ? { OR: [{ name: { contains: search, mode: 'insensitive' as const } }] }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.business.findMany({
      where,
      include: {
        category: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.business.count({ where }),
  ])

  return { items, meta: { total, page, limit } }
}

export async function approveBusiness(id: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: { owner: { select: { email: true } } },
  })
  if (!business) throw new NotFoundError('İşletme bulunamadı')

  const updated = await prisma.business.update({ where: { id }, data: { status: 'active' } })

  try {
    await emailService.sendBusinessApproved(business.owner.email, business.name)
  } catch {
    // Email hatası kritik değil
  }

  return updated
}

export async function rejectBusiness(id: string, reason?: string) {
  const business = await prisma.business.findUnique({
    where: { id },
    include: { owner: { select: { email: true } } },
  })
  if (!business) throw new NotFoundError('İşletme bulunamadı')

  const updated = await prisma.business.update({ where: { id }, data: { status: 'rejected' } })

  try {
    await emailService.sendBusinessRejected(business.owner.email, business.name, reason)
  } catch {
    // Email hatası kritik değil
  }

  return updated
}

export async function suspendBusiness(id: string) {
  const business = await prisma.business.findUnique({ where: { id } })
  if (!business) throw new NotFoundError('İşletme bulunamadı')
  return prisma.business.update({ where: { id }, data: { status: 'suspended' } })
}

export async function getStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalBusinesses,
    pendingBusinesses,
    totalUsers,
    monthlyAppointments,
    monthlyRevenue,
  ] = await Promise.all([
    prisma.business.count(),
    prisma.business.count({ where: { status: 'pending' } }),
    prisma.user.count(),
    prisma.appointment.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({
      where: { status: 'completed', createdAt: { gte: startOfMonth } },
      _sum: { amount: true },
    }),
  ])

  return {
    totalBusinesses,
    pendingBusinesses,
    totalUsers,
    totalAppointments: monthlyAppointments,
    totalRevenue: Number(monthlyRevenue._sum.amount ?? 0),
  }
}
