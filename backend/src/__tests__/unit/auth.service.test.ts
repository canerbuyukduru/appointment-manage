import { ConflictError, ForbiddenError, UnauthorizedError } from '@/lib/errors'

// ─── Mocklar ─────────────────────────────────────────────────────────────────

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}))

jest.mock('@/lib/redis', () => ({
  redis: {
    setex: jest.fn().mockResolvedValue('OK'),
    get: jest.fn(),
    del: jest.fn().mockResolvedValue(1),
  },
  getCache: jest.fn(),
  setCache: jest.fn(),
  deleteCache: jest.fn(),
}))

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('$hashed_password'),
  compare: jest.fn(),
}))

jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock_token'),
  verify: jest.fn(),
}))

// ─── Import'lar (mock'lardan sonra) ──────────────────────────────────────────

import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'
import bcrypt from 'bcryptjs'
import * as authService from '@/services/auth.service'

// ─── Yardımcı tipler ve sabitler ─────────────────────────────────────────────

const mockPrismaUser = prisma.user as jest.Mocked<typeof prisma.user>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockRedis = redis as jest.Mocked<typeof redis>

/**
 * DB'den dönen tam kullanıcı nesnesi (passwordHash dahil — login için).
 */
const dbUserWithHash = {
  id: 'user-uuid-1',
  email: 'test@example.com',
  passwordHash: '$2a$12$realHashedPassword',
  role: 'customer' as const,
  firstName: 'Ahmet',
  lastName: 'Yılmaz',
  phone: '+905551234567',
  avatar: null,
  birthDate: null,
  gender: null,
  status: 'active' as const,
  emailVerified: false,
  phoneVerified: false,
  createdAt: new Date('2024-01-01T00:00:00.000Z'),
  updatedAt: new Date('2024-01-01T00:00:00.000Z'),
}

/**
 * Prisma select ile dönen kullanıcı (passwordHash yok — register/getMe için).
 */
const safeDbUser = ((): typeof dbUserWithHash => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { passwordHash: _ph, ...rest } = dbUserWithHash
  return rest as typeof dbUserWithHash
})()

/** Sahte Express Response */
function makeMockRes() {
  return {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as import('express').Response
}

// ─── AuthService.register ─────────────────────────────────────────────────────

describe('AuthService.register', () => {
  beforeEach(() => jest.clearAllMocks())

  it('yeni kullanıcı oluşturur ve SafeUser döndürür', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockPrismaUser.create.mockResolvedValue(safeDbUser as never)

    const res = makeMockRes()
    const result = await authService.register(
      {
        email: 'test@example.com',
        password: 'Guclu@123',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
        phone: '+905551234567',
      },
      res,
    )

    expect(result).toHaveProperty('user')
    expect(result).toHaveProperty('accessToken', 'mock_token')
    expect(result.user.email).toBe('test@example.com')
    expect(mockBcrypt.hash).toHaveBeenCalledWith('Guclu@123', 12)
    expect(mockPrismaUser.create).toHaveBeenCalledTimes(1)
    expect(mockRedis.setex).toHaveBeenCalledTimes(1)
  })

  it('email zaten kayıtlıysa ConflictError fırlatır', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(dbUserWithHash as never)

    const res = makeMockRes()
    await expect(
      authService.register(
        {
          email: 'test@example.com',
          password: 'Guclu@123',
          firstName: 'Ahmet',
          lastName: 'Yılmaz',
        },
        res,
      ),
    ).rejects.toThrow(ConflictError)

    expect(mockPrismaUser.create).not.toHaveBeenCalled()
  })

  it('passwordHash response\'a dahil edilmez', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockPrismaUser.create.mockResolvedValue(safeDbUser as never)

    const res = makeMockRes()
    const { user } = await authService.register(
      {
        email: 'test@example.com',
        password: 'Guclu@123',
        firstName: 'Ahmet',
        lastName: 'Yılmaz',
      },
      res,
    )

    expect(user).not.toHaveProperty('passwordHash')
  })
})

// ─── AuthService.login ────────────────────────────────────────────────────────

describe('AuthService.login', () => {
  beforeEach(() => jest.clearAllMocks())

  it('geçerli credentials ile user ve token döndürür', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(dbUserWithHash as never)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const res = makeMockRes()
    const result = await authService.login('test@example.com', 'Guclu@123', res)

    expect(result.user.email).toBe('test@example.com')
    expect(result.accessToken).toBe('mock_token')
    expect(mockBcrypt.compare).toHaveBeenCalledWith('Guclu@123', dbUserWithHash.passwordHash)
    expect(result.user).not.toHaveProperty('passwordHash')
  })

  it('yanlış email ile UnauthorizedError fırlatır (bcrypt.compare yine de çağrılır)', async () => {
    // Timing attack önlemi: kullanıcı bulunamasa bile bcrypt çalışmalı
    mockPrismaUser.findUnique.mockResolvedValue(null)
    mockBcrypt.compare.mockResolvedValue(false as never)

    const res = makeMockRes()
    await expect(
      authService.login('yok@example.com', 'herhangi', res),
    ).rejects.toThrow(UnauthorizedError)

    // bcrypt.compare mutlaka çağrılmış olmalı (timing attack önlemi)
    expect(mockBcrypt.compare).toHaveBeenCalledTimes(1)
  })

  it('yanlış şifre ile UnauthorizedError fırlatır', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(dbUserWithHash as never)
    mockBcrypt.compare.mockResolvedValue(false as never)

    const res = makeMockRes()
    await expect(
      authService.login('test@example.com', 'YanlisSifre@1', res),
    ).rejects.toThrow(UnauthorizedError)

    expect(mockBcrypt.compare).toHaveBeenCalledWith('YanlisSifre@1', dbUserWithHash.passwordHash)
  })

  it('suspended kullanıcı için ForbiddenError fırlatır', async () => {
    const suspendedUser = { ...dbUserWithHash, status: 'suspended' as const }
    mockPrismaUser.findUnique.mockResolvedValue(suspendedUser as never)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const res = makeMockRes()
    await expect(
      authService.login('test@example.com', 'Guclu@123', res),
    ).rejects.toThrow(ForbiddenError)
  })

  it('deleted kullanıcı için ForbiddenError fırlatır', async () => {
    const deletedUser = { ...dbUserWithHash, status: 'deleted' as const }
    mockPrismaUser.findUnique.mockResolvedValue(deletedUser as never)
    mockBcrypt.compare.mockResolvedValue(true as never)

    const res = makeMockRes()
    await expect(
      authService.login('test@example.com', 'Guclu@123', res),
    ).rejects.toThrow(ForbiddenError)
  })
})

// ─── AuthService.refreshToken ─────────────────────────────────────────────────

describe('AuthService.refreshToken', () => {
  beforeEach(() => jest.clearAllMocks())

  it('geçerli token ile yeni access token döndürür', async () => {
    mockRedis.get.mockResolvedValue('valid_refresh_token')
    mockPrismaUser.findUnique.mockResolvedValue(safeDbUser as never)

    const res = makeMockRes()
    const result = await authService.refreshToken('valid_refresh_token', 'user-uuid-1', res)

    expect(result).toHaveProperty('accessToken', 'mock_token')
    expect(mockRedis.get).toHaveBeenCalledWith('refresh:user-uuid-1')
    // Token rotation: yeni refresh token Redis'e yazılmalı
    expect(mockRedis.setex).toHaveBeenCalledTimes(1)
  })

  it('Redis\'teki token ile eşleşmiyorsa UnauthorizedError fırlatır', async () => {
    mockRedis.get.mockResolvedValue('different_stored_token')

    const res = makeMockRes()
    await expect(
      authService.refreshToken('incoming_token', 'user-uuid-1', res),
    ).rejects.toThrow(UnauthorizedError)

    // Eşleşmediği için Prisma sorgusu yapılmamalı
    expect(mockPrismaUser.findUnique).not.toHaveBeenCalled()
  })

  it('Redis\'te token yoksa UnauthorizedError fırlatır', async () => {
    mockRedis.get.mockResolvedValue(null)

    const res = makeMockRes()
    await expect(
      authService.refreshToken('any_token', 'user-uuid-1', res),
    ).rejects.toThrow(UnauthorizedError)
  })
})

// ─── AuthService.getMe ────────────────────────────────────────────────────────

describe('AuthService.getMe', () => {
  beforeEach(() => jest.clearAllMocks())

  it('userId ile kullanıcıyı döndürür', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(safeDbUser as never)

    const user = await authService.getMe('user-uuid-1')

    expect(user.id).toBe('user-uuid-1')
    expect(user.email).toBe('test@example.com')
    expect(mockPrismaUser.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'user-uuid-1' } }),
    )
  })

  it('passwordHash içermez', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(safeDbUser as never)

    const user = await authService.getMe('user-uuid-1')

    expect(user).not.toHaveProperty('passwordHash')
  })

  it('kullanıcı bulunamazsa NotFoundError fırlatır', async () => {
    mockPrismaUser.findUnique.mockResolvedValue(null)

    const { NotFoundError } = await import('@/lib/errors')
    await expect(authService.getMe('nonexistent-id')).rejects.toThrow(NotFoundError)
  })
})
