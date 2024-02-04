1. Create the image
```
docker build --build-arg GO_ENV=local -t khairat-api-go-image .
```

2. Run the container
```
docker run -d \
  -p 8085:8085 \
  --name khairat-api-go \
  khairat-api-go-image
```