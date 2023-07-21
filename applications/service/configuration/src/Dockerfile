FROM node:18.16-alpine
# FROM node:16.14 # use if the mongo memory server is used

RUN apk add --no-cache git g++ make python3

RUN mkdir /app

WORKDIR /app

COPY package.json /app

RUN yarn && yarn cache clean

COPY . /app

ENV PORT=3333

ENV GLOBAL_API_PREFIX="api/configuration"

EXPOSE 3333

HEALTHCHECK CMD node healthcheck.js > /dev/null || exit 1

CMD [ "node", "/app/main.js" ]
