# ──────────────────────────────────────────────────────────────
# Stage 1: Build
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Install deps first (layer-cache friendly)
COPY package*.json ./
RUN npm ci --ignore-scripts

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Build TypeScript
COPY . .
RUN npm run build

# Prune dev deps
RUN npm prune --production

# ──────────────────────────────────────────────────────────────
# Stage 2: Production runtime
# ──────────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Security: non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy only what is needed
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

USER appuser

EXPOSE 9000

ENV NODE_ENV=production

CMD ["node", "dist/server.js"]
