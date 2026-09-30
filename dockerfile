FROM node:20-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./
COPY tsconfig*.json ./
RUN npm ci --silent --ignore-scripts

COPY src/ ./src/

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts --silent

COPY --from=builder /usr/src/app/dist ./dist

COPY migrations/ ./migrations/

USER node

EXPOSE 3000

CMD ["npm", "start"]