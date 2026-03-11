# ==========================================
# STAGE 1: BUILDER
# ==========================================
FROM node:20-bullseye-slim AS builder
WORKDIR /app

# Cache dependencies by copying package files first
COPY package*.json ./
RUN npm ci

# Copy source and build the Next.js application
COPY . .
RUN npm run build

# ==========================================
# STAGE 2: PRODUCTION RUNNER
# ==========================================
FROM python:3.11-slim AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV TEMP_DIR=/tmp

# Install system dependencies, FFmpeg, and Node.js 20
RUN apt-get update && apt-get install -y \
    ffmpeg \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install yt-dlp without caching to save space
RUN pip install --no-cache-dir yt-dlp

# Copy compiled assets from builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install ONLY production Node dependencies
RUN npm ci --omit=dev

# Expose port and start
EXPOSE 3000
CMD ["npm", "start"]
