FROM node:23-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:23-alpine
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app .
RUN npm ci --production

EXPOSE 3000

CMD ["node", "build"]
