FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json ./
COPY seed-media ./seed-media

ENV NODE_ENV=production
ENV HOST=0.0.0.0

EXPOSE 3001

CMD ["sh", "-c", "npx prisma db push && npx tsx src/server.ts"]
