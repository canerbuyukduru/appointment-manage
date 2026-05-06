import Stripe from 'stripe'
import { prisma } from '../lib/prisma'
import { NotFoundError, ForbiddenError, AppError } from '../lib/errors'
import { emailService } from './email.service'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-04-10',
})

const COMMISSION_RATE = 0.10

export async function createPaymentIntent(appointmentId: string, customerId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: { business: { select: { name: true } } },
  })
  if (!appointment) throw new NotFoundError('Randevu bulunamadı')
  if (appointment.customerId !== customerId) throw new ForbiddenError()
  if (!['pending', 'confirmed'].includes(appointment.status)) {
    throw new AppError('Bu randevu için ödeme yapılamaz', 400, 'INVALID_STATUS')
  }

  const existingPayment = await prisma.payment.findUnique({ where: { appointmentId } })
  if (existingPayment?.status === 'completed') {
    throw new AppError('Bu randevu zaten ödendi', 400, 'ALREADY_PAID')
  }

  const amount = Number(appointment.totalPrice)
  const commissionAmount = amount * COMMISSION_RATE
  const netAmount = amount - commissionAmount

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: 'try',
    metadata: { appointmentId, customerId },
  })

  if (existingPayment) {
    await prisma.payment.update({
      where: { id: existingPayment.id },
      data: { status: 'pending' },
    })
  } else {
    await prisma.payment.create({
      data: {
        appointmentId,
        customerId,
        businessId: appointment.businessId,
        amount,
        commissionAmount,
        netAmount,
        status: 'pending',
      },
    })
  }

  return { clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }
}

export async function confirmPayment(appointmentId: string, paymentIntentId: string, customerId: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      customer: { select: { email: true, firstName: true, lastName: true } },
      business: { select: { name: true } },
    },
  })
  if (!appointment) throw new NotFoundError('Randevu bulunamadı')
  if (appointment.customerId !== customerId) throw new ForbiddenError()

  const pi = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (pi.status !== 'succeeded') {
    throw new AppError('Ödeme henüz tamamlanmadı', 400, 'PAYMENT_INCOMPLETE')
  }

  const payment = await prisma.payment.update({
    where: { appointmentId },
    data: {
      status: 'completed',
      transactionId: paymentIntentId,
      paymentGatewayResponse: pi as unknown as Record<string, unknown>,
    },
  })

  await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'confirmed' } })

  try {
    await emailService.sendPaymentConfirmation(appointment.customer.email, {
      customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
      businessName: appointment.business.name,
      amount: Number(payment.amount),
      transactionId: paymentIntentId,
    })
  } catch {
    // Email hatası kritik değil
  }

  return payment
}

export async function refund(appointmentId: string, userId: string, userRole: string, reason?: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id: appointmentId },
    include: {
      payment: true,
      customer: { select: { email: true, firstName: true, lastName: true } },
      business: { select: { name: true, ownerId: true, cancellationPolicy: true },
      },
    },
  })

  if (!appointment) throw new NotFoundError('Randevu bulunamadı')
  if (!appointment.payment || appointment.payment.status !== 'completed') {
    throw new AppError('İade yapılabilecek ödeme bulunamadı', 400, 'NO_PAYMENT')
  }

  if (userRole === 'customer' && appointment.customerId !== userId) throw new ForbiddenError()
  if (userRole === 'business_owner' && appointment.business.ownerId !== userId) throw new ForbiddenError()

  const policy = appointment.business.cancellationPolicy
  const refundPct = userRole === 'business_owner' || userRole === 'admin' ? 100 : (policy?.refundPercentage ?? 100)
  const refundAmount = (Number(appointment.payment.amount) * refundPct) / 100

  if (appointment.payment.transactionId) {
    await stripe.refunds.create({
      payment_intent: appointment.payment.transactionId,
      amount: Math.round(refundAmount * 100),
    })
  }

  const updated = await prisma.payment.update({
    where: { id: appointment.payment.id },
    data: {
      status: 'refunded',
      refundAmount,
      refundReason: reason,
      refundedAt: new Date(),
    },
  })

  try {
    await emailService.sendRefundNotification(appointment.customer.email, {
      customerName: `${appointment.customer.firstName} ${appointment.customer.lastName}`,
      businessName: appointment.business.name,
      amount: refundAmount,
    })
  } catch {
    // Email hatası kritik değil
  }

  return updated
}
