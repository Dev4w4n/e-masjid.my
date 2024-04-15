1. Create the image

```
docker build --build-arg GO_ENV=local -t tabung-api-go .
```

2. Run the container

```
docker run -d \
  -p 8082:8082 \
  --name tabung-api-go \
  tabung-api-go
```

3. [optional] to create api doc

```
https://github.com/swaggo/swag#how-to-use-it-with-gin

swag init

swag fmt
```
