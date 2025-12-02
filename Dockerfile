# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl

# Set database URL
ENV DATABASE_URL="file:./dev.db"

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Push schema to DB
RUN npx prisma db push --skip-generate

# Dev stage
FROM node:20-alpine AS dev

WORKDIR /app

# Install OpenSSL for runtime
RUN apk add --no-cache openssl

# Set database URL
ENV DATABASE_URL="file:./dev.db"

# Copy node_modules and prisma from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

# Expose port
EXPOSE 3000

# Start dev server
CMD ["npm", "run", "dev"]

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
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]