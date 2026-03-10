# ============================================
# Stage 1: Install dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install ALL dependencies (needed for build)
RUN npm ci

# ============================================
# Stage 2: Build TypeScript
# ============================================
FROM node:20-alpine AS build

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compile TypeScript
RUN npm run build

# ============================================
# Stage 3: Production image
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Create non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy package files and install production-only deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled JavaScript from build stage
COPY --from=build /app/dist ./dist

# Switch to non-root user
USER appuser

# Expose the application port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application
CMD ["node", "dist/server.js"]
