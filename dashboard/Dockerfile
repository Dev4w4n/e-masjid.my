# Stage 1: Build environment
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Copy application files and install dependencies
COPY . .

RUN npm install && npm run build

# Stage 2: Runtime environment
FROM nginx:1.21.6-alpine

ENV BUILD_VERSION="v2.0.0-docker"
ENV DOMAIN="e-masjid.my"
ENV KEYCLOAK_URL="https://loginv2.e-masjid.my"

# Copy the built application
COPY --from=builder /app/dist /usr/share/nginx/html
COPY --from=builder /app/dist /usr/share/nginx/html/ui

# Copy custom Nginx configuration
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

# Script to dynamically generate env-config.js at runtime
COPY generate-env-config.sh /docker-entrypoint.d/generate-env-config.sh
RUN chmod +x /docker-entrypoint.d/generate-env-config.sh

# Expose the application port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]