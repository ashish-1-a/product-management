FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL=/api
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build


FROM nginx:1.28-alpine AS production

RUN addgroup -S app \
    && adduser -S app -G app \
    && mkdir -p /tmp/nginx/client_temp \
                 /tmp/nginx/proxy_temp \
                 /tmp/nginx/fastcgi_temp \
                 /tmp/nginx/uwsgi_temp \
                 /tmp/nginx/scgi_temp \
    && chown -R app:app /tmp/nginx

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/dist /usr/share/nginx/html

RUN chown -R app:app /usr/share/nginx/html \
    && chown -R app:app /var/cache/nginx \
    && chown -R app:app /var/log/nginx

USER app

EXPOSE 8080

HEALTHCHECK --interval=30s \
            --timeout=5s \
            --start-period=5s \
            --retries=3 \
            CMD wget --no-verbose --tries=1 --spider \
                http://127.0.0.1:8080/health \
                || exit 1

CMD ["nginx", "-g", "daemon off;"]
