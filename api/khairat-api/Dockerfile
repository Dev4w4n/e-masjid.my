FROM openjdk:21

WORKDIR /app

COPY ./target/khairat-api.jar /app/api.jar

EXPOSE 8081

CMD ["sh", "-c", "java -jar api.jar"]