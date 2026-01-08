# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies (frozen-lockfile for consistency)
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma generate

# Build the application
RUN pnpm build

# Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files for production install
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
# Copy .env if you want to bundle it, but usually it's injected. 
# We'll skip copying .env and rely on docker-compose or injection.

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "dist/main"]
