# Multi-stage build for app-angular-1 SSR server
FROM node:20-alpine AS base

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy workspace configuration files (including original nx.json)
COPY nx.json tsconfig.base.json ./
# Required by the @nx/eslint/plugin (see nx.json)
COPY .eslintrc.js ./

# Copy app-angular-1 source code
COPY apps/app-angular-1 ./apps/app-angular-1/

# Build stage
FROM base AS builder

# Build the app-angular-1 SSR application (no linting)
RUN pnpm exec nx run app-angular-1:build --configuration=production

# Production stage
FROM node:20-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

# Create app directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY .npmrc ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy built application from builder stage
COPY --from=builder /app/dist/apps/app-angular-1 ./dist/apps/app-angular-1

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S angular -u 1001

# Change ownership of the app directory
RUN chown -R angular:nodejs /app
USER angular

# Expose the port the app runs on
EXPOSE 4000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "dist/apps/app-angular-1/server/server.mjs"]
