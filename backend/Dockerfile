FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY prisma ./prisma
COPY seed-media ./seed-media
COPY tsconfig.json ./

RUN npx prisma generate

# Bake demo media into the image (Render free has no persistent disk)
RUN mkdir -p uploads/pdfs uploads/animations \
  && cp seed-media/sample.mp4 uploads/animations/demo.mp4 \
  && npx tsx prisma/generatePdfs.ts \
  && ls -la uploads/pdfs uploads/animations

COPY src ./src

ENV NODE_ENV=production
ENV HOST=0.0.0.0
# Render sets PORT (often 10000); server.ts already respects process.env.PORT

EXPOSE 3001

# Never block forever on migrate: push schema, then always start the HTTP server
# so Render health checks can pass even if DB was already in sync.
CMD ["sh", "-c", "npx prisma db push; exec npx tsx src/server.ts"]
