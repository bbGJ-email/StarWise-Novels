# StarWise Literature Server Dockerfile
# Use Node.js 18 LTS for stability
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy prisma schema and generate client
COPY prisma ./prisma/
RUN npx prisma generate
RUN npx prisma db push --accept-data-loss

# Copy source code
COPY src ./src/

# Expose port
EXPOSE 3001

# Environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/api/health || exit 1

# Start command
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]