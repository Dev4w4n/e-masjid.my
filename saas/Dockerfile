# Stage 1: Build the saas-api
FROM golang:alpine3.19 AS builder-saas-api

# Set the working directory inside the container
WORKDIR /app

# Copy the local code to the container
COPY . .
COPY .env.* .

# Install any dependencies your application might need
RUN go get -d -v ./...
RUN go install -v ./...

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o saas-api


# Stage 2: Build the cli
FROM golang:alpine3.19 AS builder-masjid-cli

# Set the working directory inside the container
WORKDIR /app

# Copy the local code to the container
COPY ./cli .
COPY .env.* .

# Install any dependencies your application might need
RUN go get -d -v ./...
RUN go install -v ./...

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o masjid


# Stage 3: Create a minimal runtime image
FROM alpine:latest

# Define run-time environment variables
ENV GO_ENV="docker"
ENV DB_HOST="postgres"
ENV DB_PORT="5432"
ENV DB_USER="pgsql-saas"
ENV DB_PASSWORD="pgsql-saas"
ENV DB_NAME="pgsql-saas"

# Set the working directory inside the container
WORKDIR /app

# Copy only the built binary from the builder-saas-api stage
COPY --from=builder-saas-api /app/saas-api .
COPY --from=builder-saas-api /app/wait-for-it.sh . 
COPY --from=builder-saas-api /app/start-and-seed.sh .
COPY --from=builder-saas-api /app/*.sql .
COPY --from=builder-masjid-cli /app/masjid /usr/bin/masjid

# Expose the port that your application will run on
EXPOSE 8080

# Script to dynamically generate .env.docker at runtime
COPY generate-env.sh /docker-entrypoint.d/generate-env.sh
RUN chmod +x /docker-entrypoint.d/generate-env.sh

# Copy the custom entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Command to run your application
CMD ["./saas-api", "-env", "$GO_ENV"]
