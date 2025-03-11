
FROM node:16

WORKDIR /app

COPY package*.json ./

RUN yarn install

# Install nodemon globally for automatic reloads
RUN yarn add -g nodemon

COPY . .

EXPOSE 3001
