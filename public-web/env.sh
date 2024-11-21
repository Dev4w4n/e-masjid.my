#!/bin/sh

for i in $(env | grep EMASJID_REACT_APP_)
do
  key=$(echo "$i" | cut -d '=' -f 1)
  value=$(echo "$i" | cut -d '=' -f 2-)

  # Debug: Show original values
  echo "Original: $key=$value"

  # No need for script arguments, directly use the values
  echo "Using environment value for $key: $value"

  # Replace placeholders in files
  find /usr/share/nginx/html -type f \( -name '*.js' -o -name '*.css' \) \
    -exec sed -i "s|${key}|${value}|g" '{}' +

  find /usr/share/nginx/html/web -type f \( -name '*.js' -o -name '*.css' \) \
    -exec sed -i "s|${key}|${value}|g" '{}' +

  # Debug: Confirm replacement
  grep -q "${value}" /usr/share/nginx/html/*.js /usr/share/nginx/html/*.css && \
    echo "Replaced ${key} in files." || \
    echo "Warning: ${key} not found in files."

  grep -q "${value}" /usr/share/nginx/html/web/*.js /usr/share/nginx/html/web/*.css && \
    echo "Replaced ${key} in files." || \
    echo "Warning: ${key} not found in files."
done
