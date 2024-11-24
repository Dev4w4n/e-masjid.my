echo "Generating env-config.js..."
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_BUILD_VERSION: "${BUILD_VERSION}",
  REACT_APP_DOMAIN: "${DOMAIN}",
  REACT_APP_KEYCLOAK_BASE_URL: "${KEYCLOAK_URL}"
}
EOF

cp /usr/share/nginx/html/env-config.js /usr/share/nginx/html/web

echo "env-config.js created with the following content:"
cat /usr/share/nginx/html/env-config.js