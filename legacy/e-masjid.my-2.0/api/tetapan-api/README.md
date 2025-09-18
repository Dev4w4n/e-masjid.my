1. Create the image

```
docker build --build-arg GO_ENV=local -t tetapan-api-go-image .
```

2. Run the container

```
docker run -d \
  -p 8085:8085 \
  --name tetapan-api-go \
  tetapan-api-go-image
```

3. [optional] to create api doc

```
go get -u github.com/swaggo/swag
https://github.com/swaggo/swag#how-to-use-it-with-gin

swag init

swag fmt
```
