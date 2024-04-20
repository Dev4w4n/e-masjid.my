FROM node:20.12-alpine3.19 AS builder
WORKDIR /app
COPY . .
RUN npm install  webpack-cli -g
RUN npm install
RUN npm run build
RUN npm prune --omit=dev
RUN ls -lah

FROM nginx:1.25.2-alpine-slim as production
ENV NODE_ENV production
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo $(ls -1 /usr/share/nginx/html)
RUN chown nginx:nginx -R /usr/share/nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN echo $(ls -1 /etc/nginx/conf.d/)

EXPOSE 4000

CMD ["nginx", "-g", "daemon off;"]