# Use the official PostgreSQL image with Alpine Linux as the base image
FROM postgres:alpine3.19

# Set environment variables for PostgreSQL
ENV POSTGRES_DB=mydatabase
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword

# Set the working directory inside the container
WORKDIR /docker-entrypoint-initdb.d

# Copy the SQL files into the container
COPY khairat.sql /docker-entrypoint-initdb.d/
COPY tabung.sql /docker-entrypoint-initdb.d/
COPY cadangan.sql /docker-entrypoint-initdb.d/

# Create a volume for persistent storage
VOLUME /var/lib/postgresql/data
