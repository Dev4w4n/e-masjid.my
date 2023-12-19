# E-Masjid 

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
### 2. Setup Postgres container
1. Create the image
```
cd postgres
docker build -t emasjid-postgres-image .
```

2. Run the container
```
docker run -d \
  -p 5432:5432 \
  -e POSTGRES_DB=mydatabase \
  -e POSTGRES_USER=myuser \
  -e POSTGRES_PASSWORD=mypassword \
  -v my-postgres-volume:/var/lib/postgresql/data \
  --name emasjid-postgres \
  emasjid-postgres-image
```
### 3. Run api-khairat
```
cd api-khairat
mvn clean package -P dev
java -jar ./target/api.jar
```
### 4. Run api-tabung
```
cd api-tabung
mvn clean package -P dev
java -jar ./target/api.jar
```
### 5. Run dashbord
```
cd dashboard
npm install
npm start
```

### 6. Open dashboard in browser
```
http://localhost:3000
```
## More to come ....
