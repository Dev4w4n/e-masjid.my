# Stage 1: Build environment
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Set environment variables
RUN echo "PORT=3000" > .env && \
    echo "CHOKIDAR_USEPOLLING=true" >> .env && \
    echo "REACT_APP_ENV=docker" >> .env && \
    echo "PUBLIC_URL=." >> .env && \
    echo "REACT_APP_BUILD_VERSION=EMASJID_REACT_APP_BUILD_VERSION" >> .env && \
    echo "REACT_APP_DOMAIN=EMASJID_REACT_APP_DOMAIN" >> .env

# Copy application files
COPY . .

# Install dependencies and build the production app
# RUN npm install && npm run build
RUN npm install && npm run build   

# Stage 2: Runtime environment
FROM nginx:1.21.6-alpine

ARG BUILD_VERSION
ARG DOMAIN

# Copy the built application from the builder stage
COPY --from=builder /app/build /usr/share/nginx/html
COPY --from=builder /app/build /usr/share/nginx/html/web

COPY /nginx-custom.conf /etc/nginx/conf.d/default.conf

COPY env.sh /docker-entrypoint.d/env.sh

EXPOSE 80

RUN chmod +x /docker-entrypoint.d/env.sh $BUILD_VERSION $DOMAIN