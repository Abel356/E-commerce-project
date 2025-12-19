# ---------- deps ----------
FROM node:20 AS deps
WORKDIR /app/backend

# Install dependencies first (cache-friendly)
COPY backend/package*.json ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Prisma client generation needs the schema
COPY backend/prisma ./prisma
RUN npx prisma generate


# ---------- build ----------
FROM node:20 AS build
WORKDIR /app/backend

# Bring in node_modules (already has generated prisma client)
COPY --from=deps /app/backend/node_modules ./node_modules

# Copy backend source
COPY backend/ ./

# Run build if your backend has it (won't fail if absent)
RUN npm run build --if-present

# Make sure /dist exists so the next stage COPY never fails.
# If you don't actually build to dist/, we create a small shim entry that loads your real app.
RUN mkdir -p dist && \
    if [ ! -f dist/index.js ]; then \
      if [ -f src/index.js ]; then \
        printf "require('../src/index.js');\n" > dist/index.js; \
      elif [ -f index.js ]; then \
        printf "require('../index.js');\n" > dist/index.js; \
      else \
        printf "console.error('No entry file found. Expected src/index.js or index.js'); process.exit(1);\n" > dist/index.js; \
      fi; \
    fi


# ---------- runner ----------
FROM node:20-slim AS runner
WORKDIR /app/backend

ENV NODE_ENV=production
ENV PORT=8080

# Copy node_modules and prune dev deps (keeps generated prisma client)
COPY --from=deps /app/backend/node_modules ./node_modules
RUN npm prune --omit=dev && npm cache clean --force

# Copy runtime files (dist always exists now)
COPY --from=build /app/backend/dist ./dist

# If you want migrations available in the image (often useful):
COPY --from=build /app/backend/prisma ./prisma

EXPOSE 8080
USER node

# Always starts via dist/index.js (real build OR shim to src/index.js)
CMD ["node", "dist/index.js"]