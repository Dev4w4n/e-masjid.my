<p align="center">
  <img src="./public-web/src/assets/home/logo.png" alt="E-Masjid.My" width="80" height="80"/>
</p>

<h2 align="center"><b>E-Masjid.My</b></h2>
<p align="center"><b>Sistem masjid untuk semua</b></p>
<p align="center">
  E-Masjid.My is a free and open source (MIT License) mosque management system
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

**We give, not take**

- We should be contributing to the Muslim community, rather than benefiting from them, especially the Masjid.


## Prerequisites
1. Docker
2. Java 17 (Spring Boot 3.2.0)
3. Maven
4. Node 20 (ReactJS 18 + CoreUI + Tailwind CSS)

## Quickstart guide ( Docker compose )
### Clone this repo
```
git clone https://github.com/Dev4w4n/e-masjid.my.git;
cd e-masjid.my
```
### run-dev.sh (for Linux)
```
sh run-dev.sh
```
### run-dev.bat (for Windows)
```
run-dev.bat
```

This will automatically build all the APIs, and run the docker-compose file where it will spin up 6 containers for the developments environment.

Once the containers are up, you may stop any of the containers depending on what you will be working on to free up your local resources.

## Gradle Build

You may utilise ./gradlew (or gradlew.bat on windows) provided to configure/execute your build. The commands below will show available tasks on gradle:

```
./gradlew task

./gradlew task --all
```

## Contributing guide

Please fork this repo and submit your PR.

We love your input! We want to make contributing to this project as easy and transparent as possible, whether it's:

- Reporting a bug
- Submitting a fix
- Proposing new features
- Enhancing features
- Documentation
- Unit testing
  
Or you would just like to chat with us, find us on [Discord](https://discord.gg/vz4WWM85)

