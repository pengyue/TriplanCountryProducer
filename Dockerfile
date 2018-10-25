FROM node:8-slim

RUN apt-get update

WORKDIR /app

COPY package*.json ./

RUN npm install --only=production

# Bundle app source
COPY . .

EXPOSE 80
CMD [ "npm", "start" ]