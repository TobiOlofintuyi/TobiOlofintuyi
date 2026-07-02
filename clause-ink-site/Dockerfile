# clause.ink — private static preview for fly.io
# Multi-stage: build the Astro site, then serve dist/ via nginx behind
# HTTP basic auth. Auth is FAIL-CLOSED: the container refuses to start
# unless BASIC_AUTH_USER / BASIC_AUTH_PASS are set (fly secrets), so this
# surface can never be accidentally public.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache apache2-utils
COPY --from=build /app/dist /usr/share/nginx/html
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/entrypoint.sh"]
