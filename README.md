<p align="center">
  <img src="./public-web/src/assets/home/logo.png" alt="E-Masjid.My" width="80" height="80"/>
</p>

<h2 align="center"><b>E-Masjid.My</b></h2>
<p align="center"><b>Sistem masjid untuk semua</b></p>
<p align="center">
  E-Masjid.My is free and open source (Apache-2.0 License) mosque management system
<p><br>

Philosophy
=====
The main goals for this system are listed below.

**Easy of use**

Not everyone is an IT expert. Designing a system for non-IT people needs careful consideration.

**Time to use your IT skills for good deeds**

Open source is a form of sadaqah which is a required practise in Islam.

##  Prerequisite
1. Docker
2. Java 17
3. Node 20

## Quickstart guide
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
mvn clean package -P dev;java -jar ./target/khairat-api-1.0.0.jar
```
### 4. cd into ./api/tabung-api folder
```
mvn clean package -P dev;java -jar ./target/tabung-api-1.0.0.jar
```
### 5. cd into ./api/cadangan-api folder
```
mvn clean package -P dev;java -jar ./target/cadangan-api-1.0.0.jar
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
