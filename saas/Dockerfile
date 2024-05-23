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

# Define build-time argument for GO_ENV
ARG GO_ENV=dev

# Set Go environment variables
ENV GO_ENV=$GO_ENV

# Set the working directory inside the container
WORKDIR /app

# Copy only the built binary from the builder-saas-api stage
COPY --from=builder-saas-api /app/saas-api .
COPY --from=builder-saas-api /app/.env.* .
COPY --from=builder-saas-api /app/wait-for-it.sh . 
COPY --from=builder-saas-api /app/start-and-seed.sh .
COPY --from=builder-saas-api /app/*.sql .
COPY --from=builder-masjid-cli /app/masjid /usr/bin/masjid

# Expose the port that your application will run on
EXPOSE 8080

# Command to run your application
CMD ["./saas-api", "-env", "$GO_ENV"]
