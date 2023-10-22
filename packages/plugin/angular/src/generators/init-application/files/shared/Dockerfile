FROM registry.gitlab.com/rxap/docker/i18n-nginx:alpine

ARG PROJECT_NAME
ARG SUB_DOMAIN

RUN if [ -z "$SUB_DOMAIN" ]; then exit 1; fi
RUN if [ -z "$PROJECT_NAME" ]; then exit 1; fi

ENV TRAEFIK_SERVICE_NAME=$PROJECT_NAME

ENV TRAEFIK_ROUTER_NAME=$PROJECT_NAME
ENV TRAEFIK_ROUTER_PRIORITY=10
ENV TRAEFIK_ROUTER_SUB_DOMAIN=$SUB_DOMAIN

ENV TREAFIK_HEALTH_CHECK_INTERVAL=60s
ENV TREAFIK_HEALTH_CHECK_TIMEOUT=10s
ENV TREAFIK_HEALTH_CHECK_PATH=/index.html

LABEL traefik.enable=true

LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.path=$TREAFIK_HEALTH_CHECK_PATH
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.interval=$TREAFIK_HEALTH_CHECK_INTERVAL
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.healthCheck.timeout=$TREAFIK_HEALTH_CHECK_TIMEOUT
LABEL traefik.http.services.$TRAEFIK_SERVICE_NAME.loadbalancer.server.port=80

LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.rule=HostRegexp(`${TRAEFIK_ROUTER_SUB_DOMAIN}{domain:.+}`)
LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.priority=$TRAEFIK_ROUTER_PRIORITY
LABEL traefik.http.routers.$TRAEFIK_ROUTER_NAME.service=$TRAEFIK_SERVICE_NAME

COPY . /usr/share/nginx/html
