FROM openjdk:21

WORKDIR /app

COPY ./target/tetapan-api.jar /app/api.jar

EXPOSE 8085

CMD ["sh", "-c", "java -jar api.jar"]