This npm package provides generators and executors for NestJS applications within an Nx workspace. It helps streamline the setup of NestJS projects with features like Swagger, Sentry, health indicators, and standardized configurations. It also includes executors for generating package.json files and Swagger documentation.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-nestjs?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-nestjs)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-nestjs)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-nestjs)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-nestjs)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)
  - [init-library](#init-library)
  - [init-application](#init-application)
  - [swagger](#swagger)
  - [sentry](#sentry)
  - [validator](#validator)
  - [open-api](#open-api)
  - [jwt](#jwt)
  - [health-indicator](#health-indicator)
  - [health-indicator-init](#health-indicator-init)
  - [microservice](#microservice)
  - [feature-microservice](#feature-microservice)
  - [frontend-microservice](#frontend-microservice)
  - [dynamic-configuration-module](#dynamic-configuration-module)
- [Executors](#executors)
  - [package-json](#package-json)
  - [swagger-generate](#swagger-generate)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-nestjs
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-nestjs:init
```
# Guides

# Application

## Standalone

Use the nx generate to create a new application:

```bash
NAME=app
nx g @nx/nest:application \
  --name=service-$NAME \
  --directory service/$NAME \
  --projectNameAndRootFormat as-provided \
  --tags service,nest
```

Initialize the application:

```bash
nx g @rxap/plugin-nestjs:init-application \
  --project service-$NAME \
  --cleanup \
  --generateMain \
  --overwrite
```

## Standalone Microservice

Use the nx generate to create a new standalone microservice:

```bash
nx g @rxap/plugin-nestjs:microservice --name $NAME
```

## Frontend Microservice

Run the following command to create a new frontend microservice:

```bash
nx g @rxap/plugin-nestjs:frontend-microservice --feature $FEATURE --frontend $PROJECT
```

## Feature Microservice

Run the following command to create a new feature microservice:

```bash
nx g @rxap/plugin-nestjs:feature-microservice --feature $FEATURE --frontend $PROJECT
```

# Generators

## init
> init generator

```bash
nx g @rxap/plugin-nestjs:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
skipFormat | boolean | false | 
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization

## init-library
> init-library generator

```bash
nx g @rxap/plugin-nestjs:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
overwrite | boolean | false | Whether to overwrite existing files
skipFormat | boolean | false | 
skipProjects | boolean | false | Whether to skip executing project specific initialization
targets | object |  | 

## init-application
> init-application generator

```bash
nx g @rxap/plugin-nestjs:init-application
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
projects | array |  | 
sentry | boolean | true | Whether this service should use sentry
skipFormat | boolean | false | 
swagger | boolean | true | Whether this service should use swagger
swaggerLive | boolean | false | Whether this service should start a swagger live server
generateMain | boolean | false | Whether the main file should be generated
healthIndicator | boolean | true | Whether this service should use a health indicator
healthIndicatorList | array |  | A list of health indicators
validator | boolean | true | Whether this service use the ValidationPipe
platform | string | express | 
port | number |  | The default port where the server is listens
apiPrefix |  |  | 
pluginBuildInfoOptions | object |  | 
pluginDockerOptions | object |  | 
sentryDsn | string |  | Default sentry dsn
overwrite | boolean | false | Whether to overwrite existing files
jwt | boolean | false | Whether the application should use jwt
openApi | boolean | false | Whether the application should use openApi as client
skipProjects | boolean | false | Whether to skip executing project specific initialization
apiConfigurationFile | string |  | The api configuration file to use
standalone | boolean | false | Whether the nest service should be standalone
typeorm | string | none | 
bootstrap | string | monolithic | 
transport | string | none | The transport to use for microservices communication
minio | boolean | false | Whether the application should use minio
openai | boolean | false | Whether the application should use openai

## swagger
> swagger generator

```bash
nx g @rxap/plugin-nestjs:swagger
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
overwrite | boolean |  | 
standalone | boolean | false | Whether the nest service should be standalone

## sentry
> sentry generator

```bash
nx g @rxap/plugin-nestjs:sentry
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
dsn | string |  | Default sentry dsn
required | boolean |  | Whether or not the sentry dsn should be required to start the application
overwrite | boolean | false | Whether to overwrite existing files

## validator
> validator generator

```bash
nx g @rxap/plugin-nestjs:validator
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
overwrite | boolean |  | 

## open-api
> open-api generator

```bash
nx g @rxap/plugin-nestjs:open-api
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
overwrite | boolean |  | 

## jwt
> jwt generator

```bash
nx g @rxap/plugin-nestjs:jwt
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
overwrite | boolean |  | 

## health-indicator
> health-indicator generator

```bash
nx g @rxap/plugin-nestjs:health-indicator
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of the health indicator class
project | string |  | The name of the project.
overwrite | boolean |  | 

## health-indicator-init
> health-indicator-init generator

```bash
nx g @rxap/plugin-nestjs:health-indicator-init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
overwrite | boolean |  | 

## microservice
> microservice generator

```bash
nx g @rxap/plugin-nestjs:microservice
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of microservice
directory | string |  | The directory to create the microservice in
sentry | boolean | true | Whether this service should use sentry
skipFormat | boolean | false | 
swagger | boolean | true | Whether this service should use swagger
swaggerLive | boolean | false | Whether this service should start a swagger live server
generateMain | boolean |  | Whether the main file should be generated
healthIndicator | boolean | true | Whether this service should use a health indicator
healthIndicatorList | array |  | A list of health indicators
validator | boolean | true | Whether this service use the ValidationPipe
platform | string | express | 
port | number |  | The default port where the server is listens
apiPrefix |  |  | 
sentryDsn | string |  | Default sentry dsn
overwrite | boolean | false | Whether to overwrite existing files
jwt | boolean | false | Whether the application should use jwt
openApi | boolean | false | Whether the application should use openApi as client
apiConfigurationFile | string |  | The api configuration file to use
standalone | boolean | false | Whether the nest service should be standalone

## feature-microservice
> feature-microservice generator

```bash
nx g @rxap/plugin-nestjs:feature-microservice
```

Option | Type | Default | Description
--- | --- | --- | ---
feature | string |  | The feature of the frontend project
sentry | boolean | true | Whether this service should use sentry
skipFormat | boolean | false | 
swagger | boolean | true | Whether this service should use swagger
swaggerLive | boolean | false | Whether this service should start a swagger live server
generateMain | boolean |  | Whether the main file should be generated
healthIndicator | boolean | true | Whether this service should use a health indicator
healthIndicatorList | array |  | A list of health indicators
validator | boolean | true | Whether this service use the ValidationPipe
platform | string | express | 
port | number |  | The default port where the server is listens
sentryDsn | string |  | Default sentry dsn
overwrite | boolean | false | Whether to overwrite existing files
jwt | boolean | false | Whether the application should use jwt
openApi | boolean | false | Whether the application should use openApi as client
apiConfigurationFile | string |  | The api configuration file to use
standalone | boolean | false | Whether the nest service should be standalone

## frontend-microservice
> frontend-microservice generator

```bash
nx g @rxap/plugin-nestjs:frontend-microservice
```

Option | Type | Default | Description
--- | --- | --- | ---
frontend | string |  | The name of frontend project
feature | string |  | The feature of the frontend project
sentry | boolean | true | Whether this service should use sentry
skipFormat | boolean | false | 
swagger | boolean | true | Whether this service should use swagger
swaggerLive | boolean | false | Whether this service should start a swagger live server
generateMain | boolean |  | Whether the main file should be generated
healthIndicator | boolean | true | Whether this service should use a health indicator
healthIndicatorList | array |  | A list of health indicators
validator | boolean | true | Whether this service use the ValidationPipe
platform | string | express | 
port | number |  | The default port where the server is listens
sentryDsn | string |  | Default sentry dsn
overwrite | boolean | false | Whether to overwrite existing files
jwt | boolean | false | Whether the application should use jwt
openApi | boolean | false | Whether the application should use openApi as client
apiConfigurationFile | string |  | The api configuration file to use
standalone | boolean | false | Whether the nest service should be standalone

## dynamic-configuration-module
> Extends the module with the dynamic configuration module pattern

```bash
nx g @rxap/plugin-nestjs:dynamic-configuration-module
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | 
overwrite | boolean |  | 
name | string |  | name of the module. defaults to the project name
isGlobal | boolean | true | 
# Executors

## package-json
> package-json executor


Option | Type | Default | Description
--- | --- | --- | ---
dependencies | array |  | 
includeLocalProjects | boolean | false | Include local projects in the package.json file, if they have a package.json file

## swagger-generate
> swagger-generate executor


Option | Type | Default | Description
--- | --- | --- | ---
buildTarget | string |  | 

