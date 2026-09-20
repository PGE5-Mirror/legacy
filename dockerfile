FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci --omit=dev --ignore-scripts --silent

COPY src/ ./src/
COPY migrations/ ./migrations/

USER node

EXPOSE 3000

CMD ["npm", "start"]
