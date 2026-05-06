import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seed başlatılıyor...')

  // Admin kullanıcı
  const adminPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin123!', 12)
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@randevusistemi.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@randevusistemi.com',
      passwordHash: adminPassword,
      role: 'admin',
      firstName: 'Sistem',
      lastName: 'Yöneticisi',
      emailVerified: true,
    },
  })

  // Kategoriler
  const categories = [
    { name: 'Berber', slug: 'berber', icon: '✂️', order: 1 },
    { name: 'Güzellik Merkezi', slug: 'guzellik-merkezi', icon: '💅', order: 2 },
    { name: 'Psikolog', slug: 'psikolog', icon: '🧠', order: 3 },
    { name: 'Spa & Masaj', slug: 'spa-masaj', icon: '💆', order: 4 },
    { name: 'Diş Hekimi', slug: 'dis-hekimi', icon: '🦷', order: 5 },
    { name: 'Fizyoterapi', slug: 'fizyoterapi', icon: '🏃', order: 6 },
  ]

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    })
  }

  const berberCat = await prisma.category.findUnique({ where: { slug: 'berber' } })

  // Demo işletme sahibi
  const ownerPassword = await bcrypt.hash('Owner123!', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      passwordHash: ownerPassword,
      role: 'business_owner',
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      emailVerified: true,
    },
  })

  // Demo müşteri
  const customerPassword = await bcrypt.hash('Customer123!', 12)
  await prisma.user.upsert({
    where: { email: 'musteri@demo.com' },
    update: {},
    create: {
      email: 'musteri@demo.com',
      passwordHash: customerPassword,
      role: 'customer',
      firstName: 'Ayşe',
      lastName: 'Kaya',
      emailVerified: true,
    },
  })

  // Demo işletme
  const business = await prisma.business.upsert({
    where: { slug: 'ahmet-berber-salon' },
    update: {},
    create: {
      ownerId: owner.id,
      name: 'Ahmet Berber Salonu',
      slug: 'ahmet-berber-salon',
      categoryId: berberCat!.id,
      description: 'Şehrin en iyi berber salonu. 20 yıllık tecrübe.',
      address: 'Bağdat Cad. No:42',
      city: 'İstanbul',
      phone: '+90 212 555 0001',
      status: 'active',
      cancellationPolicy: {
        create: { hoursBeforeAppointment: 24, refundPercentage: 100 },
      },
    },
  })

  // Çalışma saatleri (Pazartesi-Cumartesi 09:00-19:00, Pazar kapalı)
  await prisma.businessHour.deleteMany({ where: { businessId: business.id } })
  const hours = [
    { dayOfWeek: 0, isOpen: false, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '19:00' },
    { dayOfWeek: 6, isOpen: true, openTime: '10:00', closeTime: '17:00' },
  ]
  await prisma.businessHour.createMany({ data: hours.map((h) => ({ ...h, businessId: business.id })) })

  // Hizmetler
  const service1 = await prisma.service.upsert({
    where: { id: 'seed-service-1' },
    update: {},
    create: {
      id: 'seed-service-1',
      businessId: business.id,
      name: 'Saç Kesimi',
      description: 'Tüm saç tiplerine uygun kesim',
      duration: 30,
      price: 150,
      isActive: true,
    },
  })

  const service2 = await prisma.service.upsert({
    where: { id: 'seed-service-2' },
    update: {},
    create: {
      id: 'seed-service-2',
      businessId: business.id,
      name: 'Saç + Sakal',
      description: 'Saç kesimi ve sakal tıraşı kombosu',
      duration: 45,
      price: 200,
      isActive: true,
    },
  })

  // Personel
  const staff = await prisma.staff.upsert({
    where: { id: 'seed-staff-1' },
    update: {},
    create: {
      id: 'seed-staff-1',
      businessId: business.id,
      name: 'Mehmet Usta',
      specialization: 'Saç & Sakal',
      isActive: true,
    },
  })

  // Personel çalışma saatleri
  await prisma.staffWorkingHour.deleteMany({ where: { staffId: staff.id } })
  const staffHours = [1, 2, 3, 4, 5, 6].map((day) => ({
    staffId: staff.id,
    dayOfWeek: day,
    isAvailable: true,
    startTime: day === 6 ? '10:00' : '09:00',
    endTime: day === 6 ? '17:00' : '19:00',
  }))
  await prisma.staffWorkingHour.createMany({ data: staffHours })

  // Hizmet-Personel ataması
  for (const svc of [service1, service2]) {
    await prisma.serviceStaff.upsert({
      where: { serviceId_staffId: { serviceId: svc.id, staffId: staff.id } },
      update: {},
      create: { serviceId: svc.id, staffId: staff.id },
    })
  }

  console.log('Seed tamamlandı.')
  console.log('Demo hesaplar:')
  console.log('  Admin:       admin@randevusistemi.com / Admin123!')
  console.log('  İşletme:     owner@demo.com / Owner123!')
  console.log('  Müşteri:     musteri@demo.com / Customer123!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
