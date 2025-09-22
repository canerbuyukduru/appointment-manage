// backend/services/emailService.js

import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    // Gmail SMTP kullanarak transporter oluştur
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Gmail adresiniz
        pass: process.env.EMAIL_PASS, // Gmail App Password
      }
    });

    // Alternatif: SendGrid kullanmak isterseniz
    // this.transporter = nodemailer.createTransporter({
    //   host: 'smtp.sendgrid.net',
    //   port: 587,
    //   secure: false,
    //   auth: {
    //     user: 'apikey',
    //     pass: process.env.SENDGRID_API_KEY
    //   }
    // });
  }

  // Genel email gönderme fonksiyonu
  async sendEmail(to, subject, html, text = '') {
    try {
      const mailOptions = {
        from: {
          name: 'BeautyCenter App',
          address: process.env.EMAIL_USER
        },
        to,
        subject,
        html,
        text: text || this.stripHtml(html)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', result.messageId);
      return result;
    } catch (error) {
      console.error('Email send error:', error);
      throw error;
    }
  }

  // HTML'den text çıkar
  stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '');
  }

  // Randevu oluşturma maili
  async sendAppointmentCreated(to, appointmentData) {
    const { appointment, customerName, centerName, serviceName, startDateTime } = appointmentData;
    
    const formattedDate = new Date(startDateTime).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = new Date(startDateTime).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .appointment-card { background: #f8f9ff; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Randevunuz Oluşturuldu!</h1>
          </div>
          
          <div class="content">
            <p>Merhaba <strong>${customerName}</strong>,</p>
            
            <p>Randevunuz başarıyla oluşturuldu. Aşağıda detayları bulabilirsiniz:</p>
            
            <div class="appointment-card">
              <h3>📅 Randevu Detayları</h3>
              <p><strong>İşletme:</strong> ${centerName}</p>
              <p><strong>Hizmet:</strong> ${serviceName}</p>
              <p><strong>Tarih:</strong> ${formattedDate}</p>
              <p><strong>Saat:</strong> ${formattedTime}</p>
              <p><strong>Durum:</strong> <span style="color: #f59e0b;">Onay Bekleniyor</span></p>
            </div>
            
            <p>Randevunuz işletme tarafından onaylandıktan sonra size tekrar bilgilendirme yapılacaktır.</p>
            
            <p><strong>Önemli:</strong> Randevunuzu iptal etmek isterseniz, en az 24 saat öncesinden bildiriminiz gerekiyor.</p>
          </div>
          
          <div class="footer">
            <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
            <p>BeautyCenter App © 2025</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, 'Randevunuz Oluşturuldu 📅', html);
  }

  // Randevu onay maili
  async sendAppointmentApproved(to, appointmentData) {
    const { customerName, centerName, serviceName, startDateTime, centerPhone } = appointmentData;
    
    const formattedDate = new Date(startDateTime).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = new Date(startDateTime).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .appointment-card { background: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Randevunuz Onaylandı!</h1>
          </div>
          
          <div class="content">
            <p>Merhaba <strong>${customerName}</strong>,</p>
            
            <p>Harika haber! Randevunuz <strong>${centerName}</strong> tarafından onaylandı.</p>
            
            <div class="appointment-card">
              <h3>📅 Randevu Detayları</h3>
              <p><strong>İşletme:</strong> ${centerName}</p>
              <p><strong>Hizmet:</strong> ${serviceName}</p>
              <p><strong>Tarih:</strong> ${formattedDate}</p>
              <p><strong>Saat:</strong> ${formattedTime}</p>
              <p><strong>Durum:</strong> <span style="color: #10b981;">✅ Onaylandı</span></p>
            </div>
            
            <p>Randevunuz için hazırsınız! Lütfen belirtilen tarih ve saatte işletmede bulununuz.</p>
            
            ${centerPhone ? `<p><strong>İletişim:</strong> <a href="tel:${centerPhone}">${centerPhone}</a></p>` : ''}
            
            <p><strong>Hatırlatma:</strong> Randevunuzu iptal etmeniz gerekirse lütfen en az 24 saat önceden haber verin.</p>
          </div>
          
          <div class="footer">
            <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
            <p>BeautyCenter App © 2025</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, 'Randevunuz Onaylandı! ✅', html);
  }

  // Randevu red maili
  async sendAppointmentRejected(to, appointmentData) {
    const { customerName, centerName, serviceName, startDateTime, rejectionReason } = appointmentData;
    
    const formattedDate = new Date(startDateTime).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = new Date(startDateTime).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .appointment-card { background: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>😔 Randevu Reddedildi</h1>
          </div>
          
          <div class="content">
            <p>Merhaba <strong>${customerName}</strong>,</p>
            
            <p>Maalesef randevu talebiniz <strong>${centerName}</strong> tarafından reddedildi.</p>
            
            <div class="appointment-card">
              <h3>📅 Randevu Detayları</h3>
              <p><strong>İşletme:</strong> ${centerName}</p>
              <p><strong>Hizmet:</strong> ${serviceName}</p>
              <p><strong>Tarih:</strong> ${formattedDate}</p>
              <p><strong>Saat:</strong> ${formattedTime}</p>
              <p><strong>Durum:</strong> <span style="color: #ef4444;">❌ Reddedildi</span></p>
              ${rejectionReason ? `<p><strong>Sebep:</strong> ${rejectionReason}</p>` : ''}
            </div>
            
            <p>Farklı bir tarih ve saat için yeni randevu oluşturabilirsiniz.</p>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" class="button">Yeni Randevu Al</a>
          </div>
          
          <div class="footer">
            <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
            <p>BeautyCenter App © 2025</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, 'Randevu Talebiniz Reddedildi', html);
  }

  // Yeni müşteri hesabı maili
  async sendNewCustomerAccount(to, customerData) {
    const { customerName, tempPassword, centerName } = customerData;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .credentials-card { background: #faf5ff; border-left: 4px solid #8b5cf6; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
          .password { background: #fee2e2; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 18px; font-weight: bold; color: #dc2626; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Hesabınız Oluşturuldu!</h1>
          </div>
          
          <div class="content">
            <p>Merhaba <strong>${customerName}</strong>,</p>
            
            <p><strong>${centerName}</strong> tarafından sizin için bir hesap oluşturuldu ve randevunuz alındı.</p>
            
            <div class="credentials-card">
              <h3>🔐 Giriş Bilgileriniz</h3>
              <p><strong>Email:</strong> ${to}</p>
              <p><strong>Geçici Şifre:</strong></p>
              <div class="password">${tempPassword}</div>
            </div>
            
            <p><strong>Önemli Güvenlik Uyarısı:</strong></p>
            <ul>
              <li>İlk girişinizde mutlaka şifrenizi değiştirin</li>
              <li>Bu geçici şifreyi kimseyle paylaşmayın</li>
              <li>Güçlü bir şifre seçin (en az 8 karakter, büyük/küçük harf, rakam)</li>
            </ul>
            
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Giriş Yap</a>
          </div>
          
          <div class="footer">
            <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
            <p>BeautyCenter App © 2025</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, 'Hesabınız Oluşturuldu - Giriş Bilgileri 🔐', html);
  }

  // Randevu hatırlatma maili
  async sendAppointmentReminder(to, appointmentData) {
    const { customerName, centerName, serviceName, startDateTime, centerPhone, centerAddress } = appointmentData;
    
    const formattedDate = new Date(startDateTime).toLocaleDateString('tr-TR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const formattedTime = new Date(startDateTime).toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .reminder-card { background: #fffbeb; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 5px; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Randevu Hatırlatması!</h1>
          </div>
          
          <div class="content">
            <p>Merhaba <strong>${customerName}</strong>,</p>
            
            <p>Yarın randevunuz var! Detayları hatırlatmak istedik:</p>
            
            <div class="reminder-card">
              <h3>📅 Yarınki Randevunuz</h3>
              <p><strong>İşletme:</strong> ${centerName}</p>
              <p><strong>Hizmet:</strong> ${serviceName}</p>
              <p><strong>Tarih:</strong> ${formattedDate}</p>
              <p><strong>Saat:</strong> ${formattedTime}</p>
              ${centerAddress ? `<p><strong>Adres:</strong> ${centerAddress}</p>` : ''}
              ${centerPhone ? `<p><strong>Telefon:</strong> <a href="tel:${centerPhone}">${centerPhone}</a></p>` : ''}
            </div>
            
            <p><strong>Hatırlatma:</strong></p>
            <ul>
              <li>Lütfen 5-10 dakika erken geliniz</li>
              <li>Yanınızda kimlik belgesi bulundurunuz</li>
              <li>Maske takmayı unutmayın</li>
            </ul>
            
            <p>Randevunuzu iptal etmeniz gerekirse lütfen en kısa sürede haber verin.</p>
          </div>
          
          <div class="footer">
            <p>Bu otomatik bir emaildir, lütfen yanıtlamayın.</p>
            <p>BeautyCenter App © 2025</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail(to, 'Yarın Randevunuz Var! ⏰', html);
  }
}

// Singleton instance
const emailService = new EmailService();
export default emailService;