FROM openjdk:21

WORKDIR /app

COPY ./target/cadangan-api.jar /app/api.jar

EXPOSE 8083

CMD ["sh", "-c", "java -jar api.jar"]