import { prisma } from '../lib/prisma'
import { NotFoundError, ForbiddenError } from '../lib/errors'
import type { CreateStaffDto, UpdateStaffDto, StaffWorkingHoursDto } from '../schemas/staff.schema'

async function assertOwnership(businessId: string, userId: string, userRole: string) {
  if (userRole === 'admin') return
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) throw new NotFoundError('İşletme bulunamadı')
  if (business.ownerId !== userId) throw new ForbiddenError()
}

export async function create(businessId: string, data: CreateStaffDto, userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  return prisma.staff.create({ data: { ...data, businessId } })
}

export async function update(id: string, businessId: string, data: UpdateStaffDto, userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  const staff = await prisma.staff.findFirst({ where: { id, businessId } })
  if (!staff) throw new NotFoundError('Personel bulunamadı')
  return prisma.staff.update({ where: { id }, data })
}

export async function remove(id: string, businessId: string, userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  const staff = await prisma.staff.findFirst({ where: { id, businessId } })
  if (!staff) throw new NotFoundError('Personel bulunamadı')
  return prisma.staff.update({ where: { id }, data: { isActive: false } })
}

export async function updateWorkingHours(staffId: string, businessId: string, hours: StaffWorkingHoursDto[], userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  const staff = await prisma.staff.findFirst({ where: { id: staffId, businessId } })
  if (!staff) throw new NotFoundError('Personel bulunamadı')

  await prisma.staffWorkingHour.deleteMany({ where: { staffId } })
  return prisma.staffWorkingHour.createMany({
    data: hours.map((h) => ({ ...h, staffId })),
  })
}

export async function getByBusiness(businessId: string) {
  return prisma.staff.findMany({
    where: { businessId, isActive: true },
    include: {
      workingHours: { orderBy: { dayOfWeek: 'asc' } },
      services: { include: { service: { select: { id: true, name: true } } } },
    },
    orderBy: { name: 'asc' },
  })
}
