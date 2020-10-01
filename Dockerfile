FROM digitalpatterns/jre:latest

WORKDIR /app

ADD ./server/build/libs/reference-data-service.jar /app/

USER java

ENTRYPOINT /opt/java/openjdk/bin/java -jar /app/reference-data-service.jar

EXPOSE 8080

USER 1000
