# syntax=docker/dockerfile:1

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsdown.config.ts prisma.config.ts users.json ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci && npm cache clean --force

COPY prisma.config.ts tsconfig.json ./
COPY src/prisma ./src/prisma
COPY migrations ./migrations
COPY --from=build /app/dist ./dist
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENV NODE_ENV=production
EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]