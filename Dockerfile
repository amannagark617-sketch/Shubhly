FROM node:22-slim

WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY server.js ./
COPY src ./src
COPY public ./public
COPY data ./data

# Cloud Run sends traffic to the port in $PORT (8080 by default).
EXPOSE 8080
USER node
CMD ["node", "server.js"]
