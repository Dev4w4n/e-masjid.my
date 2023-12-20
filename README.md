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
### 2. cd into postgres folder
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
### 3. cd into khairat-api folder
```
mvn clean package -P dev
java -jar ./target/khairat-api-1.0.0.jar
```
### 4. cd into tabung-api folder
```
mvn clean package -P dev
java -jar ./target/tabung-api-1.0.0.jar
```
### 5. cd into dashbord folder
```
npm install
npm start
```

### 6. Open dashboard in browser
```
http://localhost:3000
```
## More to come ....
