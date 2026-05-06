import { prisma } from '../lib/prisma'
import { NotFoundError, ForbiddenError } from '../lib/errors'
import type { CreateServiceDto, UpdateServiceDto } from '../schemas/service.schema'

async function assertOwnership(businessId: string, userId: string, userRole: string) {
  if (userRole === 'admin') return
  const business = await prisma.business.findUnique({ where: { id: businessId } })
  if (!business) throw new NotFoundError('İşletme bulunamadı')
  if (business.ownerId !== userId) throw new ForbiddenError()
}

export async function create(businessId: string, data: CreateServiceDto, userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  return prisma.service.create({
    data: { ...data, price: data.price, businessId },
  })
}

export async function update(id: string, businessId: string, data: UpdateServiceDto, userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  const service = await prisma.service.findFirst({ where: { id, businessId } })
  if (!service) throw new NotFoundError('Hizmet bulunamadı')
  return prisma.service.update({ where: { id }, data })
}

export async function remove(id: string, businessId: string, userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  const service = await prisma.service.findFirst({ where: { id, businessId } })
  if (!service) throw new NotFoundError('Hizmet bulunamadı')
  return prisma.service.update({ where: { id }, data: { isActive: false } })
}

export async function assignStaff(serviceId: string, businessId: string, staffIds: string[], userId: string, userRole: string) {
  await assertOwnership(businessId, userId, userRole)
  const service = await prisma.service.findFirst({ where: { id: serviceId, businessId } })
  if (!service) throw new NotFoundError('Hizmet bulunamadı')

  await prisma.serviceStaff.deleteMany({ where: { serviceId } })
  if (staffIds.length > 0) {
    await prisma.serviceStaff.createMany({
      data: staffIds.map((staffId) => ({ serviceId, staffId })),
      skipDuplicates: true,
    })
  }
  return prisma.service.findUnique({ where: { id: serviceId }, include: { staff: { include: { staff: true } } } })
}

export async function getByBusiness(businessId: string) {
  return prisma.service.findMany({
    where: { businessId, isActive: true },
    include: {
      category: true,
      staff: { include: { staff: { select: { id: true, name: true } } } },
    },
    orderBy: { name: 'asc' },
  })
}
