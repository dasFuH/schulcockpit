# ------------------------------------------------------------------
# Schul-Cockpit – Multi-Stage Dockerfile
# Baut ein schlankes Standalone-Next.js-Image inkl. Prisma-Migrationen.
# ------------------------------------------------------------------

# 1) Dependencies installieren ------------------------------------------------
FROM node:22-alpine AS deps
WORKDIR /app
# libc6-compat wird von einigen native Modulen (Prisma) auf Alpine benötigt
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# 2) Build -------------------------------------------------------------------
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma-Client generieren und Next-App bauen (output: standalone)
RUN npx prisma generate
RUN npm run build

# 3) Runtime -----------------------------------------------------------------
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat
ENV NODE_ENV=production
ENV PORT=3000

# Nicht als root laufen
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Standalone-Server + statische Assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma + CLI-Abhaengigkeiten fuer "migrate deploy" und optionales Seeding beim Start
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

# Start-Skript (führt Migrationen aus und startet den Server)
COPY --chmod=755 docker-entrypoint.sh ./docker-entrypoint.sh

# Upload-Verzeichnis vorbereiten
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000

ENTRYPOINT ["./docker-entrypoint.sh"]
