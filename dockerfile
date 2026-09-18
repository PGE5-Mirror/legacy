FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY src/ ./src/

USER node

EXPOSE 3000

CMD ["npm", "start"]
