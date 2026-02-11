FROM node:20-alpine AS builder

WORKDIR /app

# Copy package file and install dependencies
COPY package.json ./
RUN npm install

# Generate Prisma client
COPY prisma ./prisma
RUN npx prisma generate

# Copy source and config, then build
COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma

# Install production dependencies only
RUN npm install --omit=dev

# Generate Prisma client in production
RUN npx prisma generate

EXPOSE 3001

CMD ["node", "dist/main"]
