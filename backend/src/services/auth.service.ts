import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { Response } from 'express'
import { prisma } from '../lib/prisma'
import { redis } from '../lib/redis'
import { ConflictError, UnauthorizedError, ForbiddenError, NotFoundError } from '../lib/errors'
import type { RegisterDto } from '../schemas/auth.schema'
import type { JwtPayload } from '../middleware/authenticate'

// passwordHash alanı çıkarılmış güvenli kullanıcı tipi
export type SafeUser = Omit<
  Awaited<ReturnType<typeof prisma.user.findUniqueOrThrow>>,
  'passwordHash'
>

// ─── Sabitler ────────────────────────────────────────────────────────────────

const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60 // 7 gün
const COOKIE_MAX_AGE_MS   = REFRESH_TTL_SECONDS * 1000

const SAFE_USER_SELECT = {
  id:            true,
  email:         true,
  role:          true,
  firstName:     true,
  lastName:      true,
  phone:         true,
  avatar:        true,
  birthDate:     true,
  gender:        true,
  status:        true,
  emailVerified: true,
  phoneVerified: true,
  createdAt:     true,
  updatedAt:     true,
} as const

// ─── Private helpers ──────────────────────────────────────────────────────────

function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '15m' })
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET!, { expiresIn: '7d' })
}

function setRefreshCookie(res: Response, token: string): void {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge:   COOKIE_MAX_AGE_MS,
  })
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
}

async function saveRefreshToken(userId: string, token: string): Promise<void> {
  await redis.setex(`refresh:${userId}`, REFRESH_TTL_SECONDS, token)
}

// ─── Service metodları ────────────────────────────────────────────────────────

export async function register(
  data: RegisterDto,
  res: Response,
): Promise<{ user: SafeUser; accessToken: string }> {
  // Email çakışma kontrolü
  const existing = await prisma.user.findUnique({ where: { email: data.email } })
  if (existing) {
    throw new ConflictError('Bu email adresi zaten kayıtlı')
  }

  // Şifreyi hashle
  const passwordHash = await bcrypt.hash(data.password, 12)

  // Kullanıcı oluştur
  const user = await prisma.user.create({
    data: {
      email:        data.email,
      passwordHash,
      firstName:    data.firstName,
      lastName:     data.lastName,
      phone:        data.phone,
    },
    select: SAFE_USER_SELECT,
  })

  // Token üret
  const accessToken  = generateAccessToken({ userId: user.id, role: user.role })
  const refreshToken = generateRefreshToken(user.id)

  // Refresh token'ı Redis'e kaydet ve cookie'ye yaz
  await saveRefreshToken(user.id, refreshToken)
  setRefreshCookie(res, refreshToken)

  return { user, accessToken }
}

export async function login(
  email: string,
  password: string,
  res: Response,
): Promise<{ user: SafeUser; accessToken: string }> {
  // Kullanıcıyı bul (passwordHash dahil — sadece bu sorgu için)
  const userWithHash = await prisma.user.findUnique({ where: { email } })

  // Timing attack önlemi: kullanıcı bulunamasa bile bcrypt karşılaştırması yap
  const dummyHash = '$2a$12$invalidhashinvalidhashinvalidhashX'
  const isValid = await bcrypt.compare(password, userWithHash?.passwordHash ?? dummyHash)

  if (!userWithHash || !isValid) {
    throw new UnauthorizedError('Email veya şifre hatalı')
  }

  // Hesap durumu kontrolü
  if (userWithHash.status === 'suspended') {
    throw new ForbiddenError('Hesabınız askıya alınmış. Lütfen destek ile iletişime geçin.')
  }
  if (userWithHash.status === 'deleted') {
    throw new ForbiddenError('Bu hesap silinmiş.')
  }

  // SafeUser: passwordHash'i çıkar
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...user } = userWithHash

  // Token üret
  const accessToken  = generateAccessToken({ userId: user.id, role: user.role })
  const refreshToken = generateRefreshToken(user.id)

  await saveRefreshToken(user.id, refreshToken)
  setRefreshCookie(res, refreshToken)

  return { user, accessToken }
}

export async function logout(userId: string, res: Response): Promise<void> {
  await redis.del(`refresh:${userId}`)
  clearRefreshCookie(res)
}

export async function refreshToken(
  incomingToken: string,
  userId: string,
  res: Response,
): Promise<{ accessToken: string }> {
  // Redis'teki token ile karşılaştır
  const storedToken = await redis.get(`refresh:${userId}`)

  if (!storedToken || storedToken !== incomingToken) {
    throw new UnauthorizedError('Geçersiz veya süresi dolmuş refresh token')
  }

  // Kullanıcıyı al (rol bilgisi için)
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: SAFE_USER_SELECT,
  })
  if (!user) throw new UnauthorizedError('Kullanıcı bulunamadı')

  // Token rotation: yeni token üret, eskisini geçersiz kıl
  const newAccessToken  = generateAccessToken({ userId: user.id, role: user.role })
  const newRefreshToken = generateRefreshToken(user.id)

  await saveRefreshToken(user.id, newRefreshToken)
  setRefreshCookie(res, newRefreshToken)

  return { accessToken: newAccessToken }
}

export async function getMe(userId: string): Promise<SafeUser> {
  const user = await prisma.user.findUnique({
    where:  { id: userId },
    select: SAFE_USER_SELECT,
  })

  if (!user) throw new NotFoundError('Kullanıcı bulunamadı')

  return user
}
