# Stage 1: Build the application
FROM golang:alpine3.19 AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy the local code to the container
COPY . .
COPY .env.* .

# Install any dependencies your application might need
RUN go get -d -v ./...
RUN go install -v ./...
RUN go install github.com/swaggo/swag/cmd/swag@latest

# Build the Go application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o tabung-api

#Generate api doc
RUN swag init

# Stage 2: Create a minimal runtime image
FROM alpine:latest

# Define build-time argument for GO_ENV
ENV GO_ENV="docker"
ENV DB_HOST="postgres"
ENV DB_PORT="5432"
ENV DB_USER="pgsql-saas"
ENV DB_PASSWORD="pgsql-saas"
ENV DB_NAME="pgsql-saas"
ENV ALLOWED_ORIGIN="*"
ENV DEPLOY_URL="/"
ENV SERVER_PORT="8082"
ENV API_DOC_URL="http://localhost:4000"

# Set the working directory inside the container
WORKDIR /app

# Copy only the built binary from the builder stage
COPY --from=builder /app/tabung-api .
COPY --from=builder /app/.env.* .
COPY --from=builder /app/wait-for-it.sh .
COPY --from=builder /app/docs ./docs

# Expose the port that your application will run on
EXPOSE $SERVER_PORT

# Script to dynamically generate .env.docker at runtime
COPY generate-env.sh /docker-entrypoint.d/generate-env.sh
RUN chmod +x /docker-entrypoint.d/generate-env.sh

# Copy the custom entrypoint
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Set the custom entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# Command to run your application
CMD ["./tabung-api", "-env", "$GO_ENV"]
