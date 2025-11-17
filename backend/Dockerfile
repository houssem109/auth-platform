# ------------ Builder Stage ------------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Generate Prisma Client during build (for TS)
RUN npx prisma generate

# Build Typescript -> dist/
RUN npm run build


# ------------ Production Stage ------------
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy dist + prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Generate prisma client in production image
RUN npx prisma generate

EXPOSE 4000

# -------------- AUTO MIGRATE + AUTO SEED + START SERVER --------------
#CMD npx prisma migrate deploy \
 # && npx prisma db seed \
 # && node dist/src/index.js


# Copy start script
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

EXPOSE 4000

CMD ["/app/start.sh"]