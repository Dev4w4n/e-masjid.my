# Use the official Postgres image
FROM postgres:alpine3.19

# Set environment variables
ENV POSTGRES_DB=pgsql-saas
ENV POSTGRES_USER=pgsql-saas
ENV POSTGRES_PASSWORD=pgsql-saas

# Expose port
EXPOSE 5432

# Define volume for persistent data
VOLUME /var/lib/postgresql/data
