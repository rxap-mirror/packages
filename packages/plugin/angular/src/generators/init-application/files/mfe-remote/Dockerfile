FROM registry.gitlab.com/rxap/docker/nginx:alpine

ARG PROJECT_NAME
ARG RELEASE

RUN if [ -z "$PROJECT_NAME" ]; then exit 1; fi
RUN if [ -z "$RELEASE" ]; then exit 1; fi

ENV TRAEFIK_SERVICE_NAME=$PROJECT_NAME

ENV TRAEFIK_ROUTER_NAME=$PROJECT_NAME
ENV TRAEFIK_ROUTER_PRIORITY=15

ENV TRAEFIK_HEALTH_CHECK_INTERVAL=60s
ENV TRAEFIK_HEALTH_CHECK_TIMEOUT=10s
ENV TRAEFIK_HEALTH_CHECK_PATH=/index.html

LABEL traefik.enable=true

LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.path=$TRAEFIK_HEALTH_CHECK_PATH
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.interval=$TRAEFIK_HEALTH_CHECK_INTERVAL
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.timeout=$TRAEFIK_HEALTH_CHECK_TIMEOUT
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.server.port=80

LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.rule=PathPrefix(`__mfe/${RELEASE}/${PROJECT_NAME}`)
LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.priority=$TRAEFIK_ROUTER_PRIORITY
LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.service=$TRAEFIK_SERVICE_NAME

COPY . /usr/share/nginx/html
