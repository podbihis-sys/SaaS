# Playwright base image ships Chromium + matching system deps.
# Tag MUST match the installed `playwright` version (see package.json).
FROM mcr.microsoft.com/playwright:v1.61.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "dist/index.js"]
