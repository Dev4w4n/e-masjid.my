# Use the official Postgres image
FROM postgres:alpine3.19

# Set environment variables
ENV POSTGRES_DB=mydatabase
ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword

# Define volume for persistent data
VOLUME /var/lib/postgresql/data
