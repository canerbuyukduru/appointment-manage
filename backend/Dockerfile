FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

# Eğer build adımı yoksa direkt çalıştırıyoruz
FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app /app

ENV NODE_ENV=production
EXPOSE 5000

CMD ["node", "index.js"]