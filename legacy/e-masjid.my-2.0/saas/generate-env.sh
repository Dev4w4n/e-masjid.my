echo "Generating .env.docker..."
cat <<EOF > /app/.env.docker
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
EOF

echo ".env.docker created with the following content:"
cat /app/.env.docker