echo "Generating .env.docker..."
cat <<EOF > /app/.env.docker
GO_ENV=${GO_ENV}
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}
ALLOWED_ORIGIN=${ALLOWED_ORIGIN}
DEPLOY_URL=${DEPLOY_URL}
SERVER_PORT=${SERVER_PORT}
API_DOC_URL=${API_DOC_URL}
EOF

echo ".env.docker created with the following content:"
cat /app/.env.docker
