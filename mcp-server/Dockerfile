# ==========================================
# MCP Maestro Server - Dockerfile
# Multi-stage build for production
# Build context: repository root (for Coolify)
# ==========================================

# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies first (cache optimization)
COPY mcp-server/package*.json ./
RUN npm ci --only=production=false

# Copy source and build
COPY mcp-server/tsconfig.json ./
COPY mcp-server/src ./src
RUN npm run build

# Stage 2: Production
FROM node:20-alpine AS production

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S maestro -u 1001 -G nodejs

WORKDIR /app

# Copy package files and install production dependencies only
COPY mcp-server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

# Copy prompts, templates, and other resources needed at runtime
COPY --chown=maestro:nodejs 01-playbook ./01-playbook
COPY --chown=maestro:nodejs 02-especialistas ./02-especialistas
COPY --chown=maestro:nodejs 03-guias ./03-guias
COPY --chown=maestro:nodejs 05-prompts ./05-prompts
COPY --chown=maestro:nodejs 06-templates ./06-templates

# Set ownership
RUN chown -R maestro:nodejs /app

# Switch to non-root user
USER maestro

# Environment
ENV NODE_ENV=production
ENV PORT=3000

# Expose port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start server
CMD ["node", "dist/index.js"]
