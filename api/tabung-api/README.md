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