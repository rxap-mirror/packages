FROM registry.gitlab.com/rxap/docker/nestjs-server:18.17-alpine

COPY package.json /app

RUN yarn && yarn cache clean

COPY . /app
