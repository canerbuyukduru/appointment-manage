import sgMail from '@sendgrid/mail'
import logger from '../lib/logger'

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '')
const FROM = process.env.SENDGRID_FROM_EMAIL || 'noreply@randevu.com'

interface AppointmentDetails {
  customerName: string
  businessName: string
  serviceName: string
  staffName: string
  date: string
  startTime: string
  endTime: string
  price: number
}

async function send(to: string, subject: string, html: string) {
  try {
    await sgMail.send({ to, from: FROM, subject, html })
  } catch (err) {
    logger.error('Email gönderilemedi:', err)
  }
}

export const emailService = {
  async sendAppointmentConfirmation(to: string, details: AppointmentDetails) {
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#2563EB;font-size:24px">Randevunuz Onaylandı</h1>
        <p>Merhaba <strong>${details.customerName}</strong>,</p>
        <p>Randevunuz başarıyla oluşturuldu.</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0">
          <tr><td style="padding:8px;background:#F3F4F6;font-weight:600">İşletme</td><td style="padding:8px">${details.businessName}</td></tr>
          <tr><td style="padding:8px;background:#F3F4F6;font-weight:600">Hizmet</td><td style="padding:8px">${details.serviceName}</td></tr>
          <tr><td style="padding:8px;background:#F3F4F6;font-weight:600">Personel</td><td style="padding:8px">${details.staffName}</td></tr>
          <tr><td style="padding:8px;background:#F3F4F6;font-weight:600">Tarih</td><td style="padding:8px">${details.date}</td></tr>
          <tr><td style="padding:8px;background:#F3F4F6;font-weight:600">Saat</td><td style="padding:8px">${details.startTime} - ${details.endTime}</td></tr>
          <tr><td style="padding:8px;background:#F3F4F6;font-weight:600">Ücret</td><td style="padding:8px">₺${details.price.toFixed(2)}</td></tr>
        </table>
        <p style="color:#6B7280;font-size:14px">İyi günler dileriz.</p>
      </div>
    `
    await send(to, `Randevu Onayı — ${details.businessName}`, html)
  },

  async sendAppointmentReminder(to: string, details: AppointmentDetails) {
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#F59E0B;font-size:24px">Randevu Hatırlatması</h1>
        <p>Merhaba <strong>${details.customerName}</strong>, yarın randevunuz var!</p>
        <p><strong>${details.businessName}</strong> — ${details.serviceName}<br/>
        <strong>${details.date}</strong> saat <strong>${details.startTime}</strong></p>
      </div>
    `
    await send(to, `Randevu Hatırlatması — ${details.businessName}`, html)
  },

  async sendPaymentConfirmation(to: string, details: { customerName: string; businessName: string; amount: number; transactionId: string }) {
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#10B981;font-size:24px">Ödeme Başarılı</h1>
        <p>Merhaba <strong>${details.customerName}</strong>,</p>
        <p><strong>₺${details.amount.toFixed(2)}</strong> tutarındaki ödemeniz alındı.</p>
        <p style="color:#6B7280;font-size:12px">İşlem No: ${details.transactionId}</p>
      </div>
    `
    await send(to, `Ödeme Onayı — ${details.businessName}`, html)
  },

  async sendRefundNotification(to: string, details: { customerName: string; businessName: string; amount: number }) {
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#2563EB;font-size:24px">İade İşlemi</h1>
        <p>Merhaba <strong>${details.customerName}</strong>,</p>
        <p><strong>₺${details.amount.toFixed(2)}</strong> tutarındaki iade işleminiz başlatıldı.</p>
      </div>
    `
    await send(to, `İade Bildirimi — ${details.businessName}`, html)
  },

  async sendBusinessApproved(to: string, businessName: string) {
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#10B981;font-size:24px">İşletmeniz Onaylandı</h1>
        <p><strong>${businessName}</strong> onaylandı ve artık platformda aktif.</p>
      </div>
    `
    await send(to, `İşletme Onayı — ${businessName}`, html)
  },

  async sendBusinessRejected(to: string, businessName: string, reason?: string) {
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h1 style="color:#EF4444;font-size:24px">Başvurunuz Reddedildi</h1>
        <p><strong>${businessName}</strong> başvurusu reddedildi.</p>
        ${reason ? `<p>Neden: ${reason}</p>` : ''}
      </div>
    `
    await send(to, `Başvuru Sonucu — ${businessName}`, html)
  },
}
