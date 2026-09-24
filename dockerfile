FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json tsconfig.json ./

RUN npm ci --ignore-scripts --silent

COPY src/ ./src/

RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts --silent

COPY --from=build /usr/src/app/dist ./dist
COPY migrations/ ./migrations/

USER node

EXPOSE 3000

CMD ["npm", "start"]
