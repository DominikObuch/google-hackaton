# Multi-stage Dockerfile for NestJS API in Nx Monorepo
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

RUN apk add --no-cache python3 make g++ git cmake

COPY package*.json ./
RUN npm install --legacy-peer-deps --node-llama-cpp-postinstall=skip

COPY . .

# Build the NestJS API
RUN npx nx build api

# --- Production Stage ---
FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev --legacy-peer-deps

# Copy compiled files
COPY --from=builder /usr/src/app/dist/apps/api ./dist

EXPOSE 8080

ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "dist/main.js"]
