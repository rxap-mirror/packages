FROM registry.gitlab.com/rxap/docker/nestjs-server:18.17-alpine

ARG PROJECT_NAME
ARG PATH_PREFIX
ARG NAME_PREFIX

RUN if [ -z "$PATH_PREFIX" ]; then exit 1; fi
RUN if [ -z "$PROJECT_NAME" ]; then exit 1; fi

ENV TRAEFIK_SERVICE_NAME=${NAME_PREFIX}${PROJECT_NAME}

ENV TRAEFIK_ROUTER_NAME=${NAME_PREFIX}${PROJECT_NAME}
ENV TRAEFIK_ROUTER_PRIORITY=20
ENV TRAEFIK_ROUTER_PATH_PREFIX=/$PATH_PREFIX/

ENV TREAFIK_HEALTH_CHECK_INTERVAL=60s
ENV TREAFIK_HEALTH_CHECK_TIMEOUT=30s
ENV TREAFIK_HEALTH_CHECK_PATH=/health

LABEL traefik.enable=true

LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.path=$TREAFIK_HEALTH_CHECK_PATH
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.interval=$TREAFIK_HEALTH_CHECK_INTERVAL
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.timeout=$TREAFIK_HEALTH_CHECK_TIMEOUT
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.server.port=$PORT

LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.rule=PathPrefix(`$TRAEFIK_ROUTER_PATH_PREFIX`)
LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.priority=$TRAEFIK_ROUTER_PRIORITY
LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.service=$TRAEFIK_SERVICE_NAME

COPY package.json /app

RUN yarn && yarn cache clean

COPY . /app
