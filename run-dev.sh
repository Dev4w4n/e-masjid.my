#!/bin/sh

cd ./api
mvn clean package -P dev -DskipTests
cd ..


cd public-web
rm -rf ./build
npm install
npm run build:dev
cd ..

cd dashboard
rm -rf ./build
npm install
npm run build:dev
cd ..

docker-compose -f docker-compose.yaml up --build -d
