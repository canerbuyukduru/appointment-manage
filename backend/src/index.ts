import 'dotenv/config'
import app from './app'
import { prisma } from './lib/prisma'
import { redis } from './lib/redis'
import logger from './lib/logger'

const PORT = process.env.PORT || 3001

async function main() {
  await prisma.$connect()
  logger.info('PostgreSQL bağlantısı kuruldu')

  await redis.ping()
  logger.info('Redis bağlantısı kuruldu')

  const server = app.listen(PORT, () => {
    logger.info(`Backend çalışıyor → http://localhost:${PORT}`)
  })

  async function shutdown(signal: string) {
    logger.info(`${signal} alındı, kapatılıyor...`)
    server.close(async () => {
      await prisma.$disconnect()
      redis.disconnect()
      logger.info('Bağlantılar kapatıldı')
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
}

main().catch((err) => {
  logger.error('Başlatma hatası:', err)
  process.exit(1)
})
