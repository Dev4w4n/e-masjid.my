<p align="center">
  <img src="./public-web/src/assets/home/logo.png" alt="E-Masjid.My" width="80" height="80"/>
</p>

<h2 align="center"><b>E-Masjid.My</b></h2>
<p align="center"><b>Sistem masjid untuk semua</b></p>
<p align="center">
  E-Masjid.My is a free and open source (Apache-2.0 License) mosque management system
<p><br>

Philosophy
=====
The main goals for this system are listed below.

**Easy of use**

- Not everyone is an IT expert. Designing a system for non-IT people needs careful consideration.

**Time to use your IT skills for good deeds**

- Open source is a form of sadaqah which is a required practice in Islam.

**Longer living**

- Hosting/Tech companies may die, but we hope that by open-sourcing this project, it will live longer for the sake of ummah.

##  Prerequisite
1. Docker
2. Java 17 (SpringBoot 3.2.0)
3. Node 20 (ReactJS 18 + Tailwind CSS)

## Quickstart guide ( Docker compose )
### 1. cd into ./api/khairat-api folder
```
mvn clean package -P dev -DskipTests;
```
### 2. cd into ./api/tabung-api folder
```
mvn clean package -P dev -DskipTests;
```
### 4. cd into ./api/cadangan-api folder
```
mvn clean package -P dev -DskipTests;
```
### 5. Docker compose from the main folder
```
docker-compose up --build
```
## Quickstart guide ( Manual )
### 1. Clone this repo
```
git clone https://github.com/Dev4w4n/e-masjid.git
cd e-masjid
```
### 2. cd into postgres folder
1. Create the image
```
docker build -t emasjid-postgres-image .
```

2. Run the container
```
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_DB=mydatabase \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  --name emasjid-postgres \
  emasjid-postgres-image
```
### 3. cd into ./api/khairat-api folder
```
mvn clean package -P dev;java -jar ./target/khairat-api.jar
```
### 4. cd into ./api/tabung-api folder
```
mvn clean package -P dev;java -jar ./target/tabung-api.jar
```
### 5. cd into ./api/cadangan-api folder
```
mvn clean package -P dev;java -jar ./target/cadangan-api.jar
```
### 6. cd into dashbord folder
```
npm install;npm start
```
### 7. Open dashboard in browser
```
http://localhost:3000
```
## More to come ....
