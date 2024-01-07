FROM openjdk:21

WORKDIR /app

COPY ./target/cadangan-public-api.jar /app/api.jar

EXPOSE 8084

CMD ["sh", "-c", "java -jar api.jar"]