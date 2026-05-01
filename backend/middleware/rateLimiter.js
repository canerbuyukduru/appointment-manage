import rateLimit from 'express-rate-limit';

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 5 deneme
  message: 'Çok fazla giriş denemesi, lütfen 15 dakika sonra tekrar deneyin',
  standardHeaders: true,
  legacyHeaders: false,
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // 3 kayıt
  message: 'Çok fazla kayıt denemesi, lütfen 1 saat sonra tekrar deneyin',
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 100 istek
  message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin',
  standardHeaders: true,
  legacyHeaders: false,
});