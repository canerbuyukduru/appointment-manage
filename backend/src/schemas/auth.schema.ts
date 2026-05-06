import { z } from 'zod'

export const registerSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email zorunludur' })
      .email('Geçerli bir email adresi giriniz'),

    password: z
      .string({ required_error: 'Şifre zorunludur' })
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/[A-Z]/, 'Şifre en az bir büyük harf içermelidir')
      .regex(/[a-z]/, 'Şifre en az bir küçük harf içermelidir')
      .regex(/[0-9]/, 'Şifre en az bir rakam içermelidir')
      .regex(/[^A-Za-z0-9]/, 'Şifre en az bir özel karakter içermelidir'),

    firstName: z
      .string({ required_error: 'Ad zorunludur' })
      .min(2, 'Ad en az 2 karakter olmalıdır')
      .max(50, 'Ad en fazla 50 karakter olabilir'),

    lastName: z
      .string({ required_error: 'Soyad zorunludur' })
      .min(2, 'Soyad en az 2 karakter olmalıdır')
      .max(50, 'Soyad en fazla 50 karakter olabilir'),

    phone: z
      .string()
      .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Geçerli bir telefon numarası giriniz')
      .optional(),
  }),
})

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ required_error: 'Email zorunludur' })
      .email('Geçerli bir email adresi giriniz'),

    password: z
      .string({ required_error: 'Şifre zorunludur' })
      .min(1, 'Şifre zorunludur'),
  }),
})

export const refreshTokenSchema = z.object({
  body: z.object({}).optional(),
})

export type RegisterDto = z.infer<typeof registerSchema>['body']
export type LoginDto = z.infer<typeof loginSchema>['body']
