# ---- Build client ----
FROM node:22-alpine AS client-builder
WORKDIR /app/client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ .
RUN npm run build

# ---- Server ----
FROM node:22-alpine AS server
WORKDIR /app
COPY server/package.json server/package-lock.json ./
RUN npm ci --omit=dev
COPY server/ .
COPY --from=client-builder /app/client/dist ./client/dist

EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "src/index.js"]
