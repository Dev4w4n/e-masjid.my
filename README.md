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
## Contributing guide

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Submitting a fix
- Proposing new features
- Enhancing features
- Documentation
- Unit testing
  
Or you would just like to chat with us, find us on [Discord](https://discord.com/channels/1186627708919230474/1186628502942924831)
