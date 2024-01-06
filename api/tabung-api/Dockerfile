FROM openjdk:21

WORKDIR /app

COPY ./target/tabung-api.jar /app/api.jar

EXPOSE 8082

CMD ["sh", "-c", "java -jar api.jar"]