@echo off

cd .\api\khairat-api
mvn clean package -P dev -DskipTests
cd ..\..

cd .\api\tabung-api
mvn clean package -P dev -DskipTests
cd ..\..

cd .\api\cadangan-api
mvn clean package -P dev -DskipTests
cd ..\..

docker-compose up --build
