#!/bin/sh

# Start the saas-api
./saas-api &

# Wait for saas-api to be ready (modify the command according to your readiness check)
while ! nc -z localhost 8090; do   
  sleep 1
done

# Run the masjid seed command
masjid seed

# Wait indefinitely to keep the container running
tail -f /dev/null
