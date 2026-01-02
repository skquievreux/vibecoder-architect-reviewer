# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set database URL
ENV DATABASE_URL="file:./dev.db"

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN pnpm exec prisma generate

# Push schema to DB
RUN pnpm exec prisma db push --skip-generate

# Dev stage
FROM node:20-alpine AS dev

WORKDIR /app

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install OpenSSL for runtime
RUN apk add --no-cache openssl

# Set database URL
ENV DATABASE_URL="file:./dev.db"

# Copy node_modules and prisma from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package.json pnpm-lock.yaml ./

# Expose port
EXPOSE 3000

# Start dev server
CMD ["pnpm", "run", "dev"]

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Install OpenSSL for runtime
RUN apk add --no-cache openssl

# Set database URL
ENV DATABASE_URL="file:./dev.db"

# Copy built app from builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start the app
CMD ["node", ".next/standalone/server.js"]