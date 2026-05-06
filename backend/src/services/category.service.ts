import { Category } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { getCache, setCache } from '../lib/redis'
import { NotFoundError } from '../lib/errors'
import { CategoryQuery } from '../schemas/category.schema'

const CACHE_KEY_ALL = 'categories:all'
const CACHE_TTL = 3600 // 1 saat

export const categoryService = {
  async getAll(query: CategoryQuery): Promise<Category[]> {
    const cacheKey = query.search || query.parentId
      ? `categories:${JSON.stringify(query)}`
      : CACHE_KEY_ALL

    const cached = await getCache<Category[]>(cacheKey)
    if (cached) return cached

    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
        ...(query.parentId ? { parentId: query.parentId } : {}),
        ...(query.search
          ? { name: { contains: query.search, mode: 'insensitive' } }
          : {}),
      },
      orderBy: { order: 'asc' },
    })

    await setCache(cacheKey, categories, CACHE_TTL)
    return categories
  },

  async getById(id: string): Promise<Category> {
    const cacheKey = `categories:${id}`
    const cached = await getCache<Category>(cacheKey)
    if (cached) return cached

    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) throw new NotFoundError('Kategori bulunamadı')

    await setCache(cacheKey, category, CACHE_TTL)
    return category
  },
}
