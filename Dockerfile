FROM node:lts-alpine

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install pm2 -g

RUN npm install


COPY . .

EXPOSE 3333
CMD ["pm2-runtime", "process.yml"]