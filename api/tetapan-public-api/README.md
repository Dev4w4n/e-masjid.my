1. Create the image
```
docker build --build-arg GO_ENV=local -t tetapan-public-api-go-image .
```

2. Run the container
```
docker run -d \
  -p 8084:8084 \
  --name tetapan-public-api-go \
  tetapan-public-api-go-image
```