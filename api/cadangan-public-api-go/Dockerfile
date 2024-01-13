# Use the official Golang image as the base image
FROM golang:1.21-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy the local code to the container
COPY . .

# Install any dependencies your application might need
# In this case, you need to install the pq driver for PostgreSQL
RUN go get -d -v ./...
RUN go install -v ./...

# Expose the port that your application will run on
EXPOSE 8080

# Command to run your application
CMD ["cadangan-public-api"]
