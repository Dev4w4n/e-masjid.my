1. Create the image
```
docker build --build-arg GO_ENV=local -t cadangan-api-go-image .
```

2. Run the container
```
docker run -d \
  -p 8083:8083 \
  --name cadangan-api-go \
  cadangan-api-go-image
```