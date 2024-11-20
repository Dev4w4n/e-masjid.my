# Stage 1: Build environment
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Build arguments for dynamic environment variables
ARG BUILD_VERSION
ARG DOMAIN

# Generate a dynamic .env file
RUN echo "PORT=3000" > .env && \
    echo "CHOKIDAR_USEPOLLING=true" >> .env && \
    echo "REACT_APP_ENV=docker" >> .env && \
    echo "PUBLIC_URL=." >> .env && \
    echo "REACT_APP_BUILD_VERSION=${BUILD_VERSION}" >> .env && \
    echo "REACT_APP_DOMAIN=${DOMAIN}" >> .env

# Copy application files
COPY . .

# Install dependencies and build the production app
RUN npm install && npm run build

# Stage 2: Runtime environment
FROM node:20-alpine AS runner

# Set the working directory
WORKDIR /app

# Copy the built application from the builder stage
COPY --from=builder /app/build ./build
COPY --from=builder /app/build ./build/web

# Install the serve package globally for running the app
RUN npm install -g serve

# Expose the application port
EXPOSE 3000

ARG BUILD_VERSION
ARG DOMAIN

ENV BUILD_VERSION=${BUILD_VERSION}
ENV DOMAIN=${DOMAIN}

# Command to start the application
CMD ["serve", "-s", "build", "-l", "3000"]
