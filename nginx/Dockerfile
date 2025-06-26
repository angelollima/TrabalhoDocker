# nginx/Dockerfile
FROM nginx:stable-alpine3.21

# instala openssl, gera certificado self-signed para localhost
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/ssl && \
    openssl req -x509 -nodes -days 365 \
    -newkey rsa:2048 \
    -subj "/C=BR/ST=SP/L=São Paulo/O=Dev/CN=localhost" \
    -keyout /etc/nginx/ssl/server.key \
    -out /etc/nginx/ssl/server.crt

# copia o arquivo de configuração
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
