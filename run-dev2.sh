#!/bin/sh

cd ./api
mvn clean package -P dev -DskipTests
cd ..

docker-compose -f docker-compose-v2.yaml up --build -d

cd public-web
docker build -t emasjid-public-web .
docker run -d \
  -p 3001:3000 \
  --name emasjid-public-web \
  emasjid-public-web

cd ../dashboard
docker build -t emasjid-dashboard .
docker run -d \
  -p 3000:3000 \
  --name emasjid-dashboard \
  emasjid-dashboard