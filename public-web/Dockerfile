# Stage 1: Build environment
FROM node:20-alpine AS builder

# Set the working directory
WORKDIR /app

# Build arguments for dynamic environment variables
ARG PUBLIC_URL
ARG REACT_APP_ENV

# Generate a dynamic .env file
RUN echo "PORT=3000" > .env && \
    echo "CHOKIDAR_USEPOLLING=true" >> .env && \
    echo "PUBLIC_URL=${PUBLIC_URL}" >> .env && \
    echo "REACT_APP_ENV=${REACT_APP_ENV}" >> .env \
    echo "BUILD_VERSION=${BUILD_VERSION}" >> .env \
    echo "DOMAIN=${DOMAIN}" >> .env

# Copy application files
COPY . .

# Install dependencies and build the production app
RUN npm install && npm run build:prod

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

# Build argument for versioning
ARG BUILD_VERSION

# Environment variable for build version
ENV BUILD_VERSION=${BUILD_VERSION}

# Domain argument for url generation
ARG DOMAIN

# Environment variable for domain
ENV DOMAIN=${DOMAIN}

# Command to start the application
CMD ["serve", "-s", "build", "-l", "3000"]
