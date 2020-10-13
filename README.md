![Reference Data Service UI CI](https://github.com/DigitalPatterns/reference-data-service/workflows/Reference%20Data%20Service%20UI%20CI/badge.svg)

# Reference Data Service

Provides a UI for viewing and updating reference data. Data is not updated directly and requires an approval process.

# Server

The spring boot application provides a server to serve the client code but also 
acts as a reverse proxy removing the need to provide any additional configuration set up in the UI.

## Bootstrap configuration

The following environment variables are required to load properties from AWS Secrets manager

* AWS_SECRETS_MANAGER_ENABLED
* AWS_ACCESS_KEY
* AWS_SECRET_KEY
* AWS_REGION

### Application configuration

The following properties need to be configured in AWS secrets manager (example format provided)
```json
{
  "auth.url": "http://localhost:8080/auth",
  "auth.realm": "elf",
  "auth.clientId": "reference-data-service",
  "formApi.url": "http://localhost:4000",
  "refData.url": "http://localhost:3000",
  "serviceDesk.url": "service desk url",
  "uiEnvironment": "LOCAL",
  "uiVersion": "ALPHA",
  "server-port": 8004,
  "tracing.zipkin.baseUrl" : "http://localhost:9411",
  "tracing.enabled" : true
}
```

Start the server and it should start on port 8004

# Client

The client code is developed using the create-react-app module. Additional scripts added:

```json
"test-coverage" : "react-scripts test \"--coverage\" \"--watchAll=false\"",
"test-coverage-watch": "react-scripts test \"--coverage\" \"--watchAll=true\"",
"lint": "eslint --ignore-pattern node_modules/ --ext .js --ext .jsx --fix src"
```

To run the UI locally in hot deploy mode you will need to run

```bash
npm run start
```

***Please refer to the the sample.env when running in hot deploy mode.***

This will use the reverse proxy defined in the package.json.  


# Assemble

To produce the final artefact, run the following from the root of the project

```bash
./gradlew clean assemble
```

This will first clean and build the client code and then copy the build directory into the static directory of the server. Giving you a final output of
reference-data-service.jar which is a spring boot app.

You can then run the final output with

```bash
  SPRING_PROFILES_ACTIVE=local java -jar server/build/libs/reference-data-service.jar
```
