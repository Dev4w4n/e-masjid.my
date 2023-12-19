1. Create the image
```
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