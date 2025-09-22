// backend/services/cronService.js

import cron from 'node-cron';
import Appointment from '../models/appoitmentsModel.js';
import BeautyCenter from '../models/beautyCentersModel.js';
import emailService from './emailService.js';

class CronService {
  constructor() {
    this.scheduledJobs = [];
    this.init();
  }

  init() {
    // Her gün saat 18:00'de yarınki randevular için hatırlatma gönder
    const reminderJob = cron.schedule('0 18 * * *', async () => {
      console.log('🔔 Running appointment reminder job...');
      await this.sendAppointmentReminders();
    }, {
      scheduled: true,
      timezone: "Europe/Istanbul"
    });

    // Test için: Her 5 dakikada bir çalışan job (geliştirme aşamasında)
    // const testJob = cron.schedule('*/5 * * * *', async () => {
    //   console.log('🧪 Test reminder job running...');
    //   await this.sendAppointmentReminders(true); // test mode
    // });

    this.scheduledJobs.push({ name: 'appointmentReminder', job: reminderJob });
    console.log('📅 Cron jobs initialized successfully');
  }

  // Randevu hatırlatmaları gönder
  async sendAppointmentReminders(testMode = false) {
    try {
      // Yarın için tarih aralığı hesapla
      const tomorrow = new Date();
      if (testMode) {
        // Test modunda bugünkü randevuları al
        tomorrow.setDate(tomorrow.getDate());
      } else {
        tomorrow.setDate(tomorrow.getDate() + 1);
      }
      
      const startOfDay = new Date(tomorrow);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(tomorrow);
      endOfDay.setHours(23, 59, 59, 999);

      // Yarınki onaylı randevuları bul (henüz hatırlatma gönderilmemiş)
      const appointments = await Appointment.find({
        startDateTime: {
          $gte: startOfDay,
          $lte: endOfDay
        },
        status: 'approved',
        reminderSent: { $ne: true } // Henüz hatırlatma gönderilmemiş
      })
      .populate('userId', 'fullName email')
      .populate('beautyCenterId', 'name phone address')
      .populate('serviceId', 'name duration price');

      console.log(`📋 Found ${appointments.length} appointments for reminders`);

      let successCount = 0;
      let failCount = 0;

      // Her randevu için email gönder
      for (const appointment of appointments) {
        try {
          if (appointment.userId.email) {
            await emailService.sendAppointmentReminder(appointment.userId.email, {
              customerName: appointment.userId.fullName,
              centerName: appointment.beautyCenterId.name,
              serviceName: appointment.serviceSnapshot?.name || appointment.serviceId?.name,
              startDateTime: appointment.startDateTime,
              centerPhone: appointment.beautyCenterId.phone,
              centerAddress: appointment.beautyCenterId.address
            });

            // Hatırlatma gönderildi olarak işaretle
            appointment.reminderSent = true;
            await appointment.save();

            successCount++;
            console.log(`✅ Reminder sent to ${appointment.userId.email}`);
          } else {
            console.log(`⚠️ No email found for user ${appointment.userId.fullName}`);
          }
        } catch (emailError) {
          console.error(`❌ Failed to send reminder to ${appointment.userId.email}:`, emailError.message);
          failCount++;
        }
      }

      console.log(`📊 Reminder summary: ${successCount} sent, ${failCount} failed`);
      
      return {
        total: appointments.length,
        success: successCount,
        failed: failCount
      };

    } catch (error) {
      console.error('💥 Error in appointment reminder job:', error);
      throw error;
    }
  }

  // Manuel hatırlatma gönderme (API endpoint için)
  async sendManualReminder(appointmentId) {
    try {
      const appointment = await Appointment.findById(appointmentId)
        .populate('userId', 'fullName email')
        .populate('beautyCenterId', 'name phone address')
        .populate('serviceId', 'name duration price');

      if (!appointment) {
        throw new Error('Appointment not found');
      }

      if (!appointment.userId.email) {
        throw new Error('Customer email not found');
      }

      await emailService.sendAppointmentReminder(appointment.userId.email, {
        customerName: appointment.userId.fullName,
        centerName: appointment.beautyCenterId.name,
        serviceName: appointment.serviceSnapshot?.name || appointment.serviceId?.name,
        startDateTime: appointment.startDateTime,
        centerPhone: appointment.beautyCenterId.phone,
        centerAddress: appointment.beautyCenterId.address
      });

      // Hatırlatma gönderildi olarak işaretle
      appointment.reminderSent = true;
      await appointment.save();

      return { success: true, message: 'Reminder sent successfully' };
    } catch (error) {
      console.error('Manual reminder error:', error);
      throw error;
    }
  }

  // Cron job'ları durdur
  stopAllJobs() {
    this.scheduledJobs.forEach(({ name, job }) => {
      job.destroy();
      console.log(`⏹️ Stopped cron job: ${name}`);
    });
    this.scheduledJobs = [];
  }

  // Aktif job'ları listele
  getActiveJobs() {
    return this.scheduledJobs.map(({ name, job }) => ({
      name,
      status: job.getStatus(),
      nextExecution: job.nextDate()
    }));
  }
}

// Singleton instance
const cronService = new CronService();

export default cronService;