1. Create the image
```
docker build --build-arg GO_ENV=local -t cadangan-public-api-go-image .
```

2. Run the container
```
docker run -d \
  -p 8084:8084 \
  --name cadangan-public-api-go \
  cadangan-public-api-go-image
```