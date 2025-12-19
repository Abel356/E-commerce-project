# ------------------ backend deps ------------------
FROM node:20-slim AS backend_deps
WORKDIR /app/backend

# Prisma warning fix
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

COPY backend/package*.json ./
RUN npm ci

COPY backend ./


# ------------------ frontend build ------------------
FROM node:20-slim AS frontend_build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build


# ------------------ runner (one public service) ------------------
FROM node:20-slim AS runner
WORKDIR /app/backend

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=8080
ENV DATABASE_URL="file:/data/dev.db"

# install prod deps only
COPY backend/package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# copy backend source
COPY --from=backend_deps /app/backend ./

# copy frontend build into backend-served folder:
# your backend should serve static files from ../public (or similar)
RUN mkdir -p public
COPY --from=frontend_build /app/frontend/dist ./public

# sqlite persistent dir (Railway volume will mount here)
RUN mkdir -p /data

EXPOSE 8080

# IMPORTANT: run src directly (no dist)
CMD ["node", "src/index.js"]