FROM nginx:alpine

ARG OUTPUT_PATH

COPY nginx.conf /etc/nginx/nginx.conf
COPY ./${OUTPUT_PATH} /usr/share/nginx/html
