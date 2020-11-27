FROM digitalpatterns/jdk:latest as build
WORKDIR /app-build
COPY . /app-build/
RUN ./gradlew clean assemble


FROM digitalpatterns/jre:latest
WORKDIR /app
COPY --from=build /app-build/server/build/libs/app-build.jar /app/reference-data-service.jar
USER java
ENTRYPOINT /opt/java/openjdk/bin/java -jar /app/reference-data-service.jar
EXPOSE 8080
USER 1000
