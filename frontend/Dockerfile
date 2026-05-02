FROM node:18-bullseye AS builder
WORKDIR /app

# Build arguments
ARG NEXT_PUBLIC_API_URL=http://145.223.81.130:5000/api

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# install deps
COPY package*.json ./
RUN npm ci

# copy source & build
COPY . .
RUN npm run build

# Runner image
FROM node:18-bullseye-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# copy needed artifacts from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
# Use next start (production)
CMD ["npm", "run", "start"]