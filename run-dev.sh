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
# docker-compose build postgres;
# docker-compose up postgres -d;
# docker-compose build khairat-api;
# docker-compose up khairat-api -d;
# docker-compose build tabung-api;
# docker-compose up tabung-api -d;
# docker-compose build cadangan-api;
# docker-compose up cadangan-api -d;
# docker-compose build cadangan-public-api;
# docker-compose up cadangan-public-api -d;
# docker-compose build tetapan-api;
# docker-compose up tetapan-api -d;
# docker-compose build dashboard;
# docker-compose up dashboard -d;
# docker-compose build public-web;
# docker-compose up public-web -d;
