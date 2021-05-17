FROM quay.io/ukhomeofficedigital/jdk:latest as build
WORKDIR /app-build
COPY . /app-build/
RUN ./gradlew clean assemble


FROM quay.io/ukhomeofficedigital/jre:latest
WORKDIR /app
COPY --from=build /app-build/server/build/libs/reference-data-service.jar /app/reference-data-service.jar
USER java
ENTRYPOINT /opt/java/openjdk/bin/java -jar /app/reference-data-service.jar
EXPOSE 8080
USER 1000
