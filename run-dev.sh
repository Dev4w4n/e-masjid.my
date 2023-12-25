#!/bin/sh

cd ./api
mvn clean package -P dev -DskipTests
cd ..

docker-compose up --build