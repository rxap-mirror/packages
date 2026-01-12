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
project | string |  | The name of the project to initialize with NestJS.
projects | array |  | The list of projects to initialize with NestJS.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.

## init-library
> init-library generator

```bash
nx g @rxap/plugin-nestjs:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the library project to initialize with NestJS.
projects | array |  | The list of library projects to initialize with NestJS.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
targets | object |  | Configuration for specific project targets.

## init-application
> init-application generator

```bash
nx g @rxap/plugin-nestjs:init-application
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the application project to initialize with NestJS.
projects | array |  | The list of application projects to initialize with NestJS.
sentry | boolean | true | Whether this application should use Sentry for error tracking.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
swagger | boolean | true | Whether this application should support Swagger/OpenAPI documentation generation.
swaggerLive | boolean | false | Whether this application should start a live Swagger server in development mode.
generateMain | boolean | false | Whether to generate the &#x27;main.ts&#x27; entry point file.
healthIndicator | boolean | true | Whether this application should include a health indicator endpoint.
healthIndicatorList | array |  | A list of specific health indicators to include.
validator | boolean | true | Whether this application should use the NestJS &#x27;ValidationPipe&#x27;.
platform | string | express | The underlying HTTP server platform to use.
port | number |  | The default port number for the application server.
apiPrefix |  |  | 
pluginBuildInfoOptions | object |  | Options for the build-info plugin.
pluginDockerOptions | object |  | Options for the Docker plugin.
sentryDsn | string |  | The default Sentry DSN for error reporting.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
jwt | boolean | false | Whether the application should use JWT authentication.
openApi | boolean | false | Whether the application should use an OpenAPI client.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
apiConfigurationFile | string |  | The path to the API configuration file.
standalone | boolean | false | Whether the NestJS application should be a standalone application.
typeorm | string | none | The TypeORM database driver to use.
bootstrap | string | monolithic | The type of application bootstrap to use.
transport | string | none | The transport mechanism to use for microservices communication.
minio | boolean | false | Whether the application should use Minio for object storage.
openai | boolean | false | Whether the application should use OpenAI integration.

## swagger
> swagger generator

```bash
nx g @rxap/plugin-nestjs:swagger
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
overwrite | boolean | false | Whether to overwrite existing files.
standalone | boolean | false | Whether the NestJS service should be standalone.

## sentry
> sentry generator

```bash
nx g @rxap/plugin-nestjs:sentry
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
dsn | string |  | The default Sentry DSN.
required | boolean | false | Whether or not the Sentry DSN should be required to start the application.
overwrite | boolean | false | Whether to overwrite existing files.

## validator
> validator generator

```bash
nx g @rxap/plugin-nestjs:validator
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
overwrite | boolean | false | Whether to overwrite existing files.

## open-api
> open-api generator

```bash
nx g @rxap/plugin-nestjs:open-api
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to add OpenApi support to.
overwrite | boolean | false | Whether to overwrite existing files.

## jwt
> jwt generator

```bash
nx g @rxap/plugin-nestjs:jwt
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to add JWT support to.
overwrite | boolean | false | Whether to overwrite existing files.

## health-indicator
> health-indicator generator

```bash
nx g @rxap/plugin-nestjs:health-indicator
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of the health indicator class.
project | string |  | The name of the project.
overwrite | boolean | false | Whether to overwrite existing files.

## health-indicator-init
> health-indicator-init generator

```bash
nx g @rxap/plugin-nestjs:health-indicator-init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project.
overwrite | boolean | false | Whether to overwrite existing files.

## microservice
> microservice generator

```bash
nx g @rxap/plugin-nestjs:microservice
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of the microservice.
directory | string |  | The directory where the microservice will be created.
sentry | boolean | true | Whether this microservice should use Sentry for error tracking.
skipFormat | boolean | false | Whether to skip formatting the generated files.
swagger | boolean | true | Whether this microservice should use Swagger/OpenAPI for documentation.
swaggerLive | boolean | false | Whether this service should start a swagger live server
generateMain | boolean | true | Whether the main entry point file (&#x60;main.ts&#x60;) should be generated.
healthIndicator | boolean | true | Whether this microservice should include a health indicator endpoint.
healthIndicatorList | array |  | A list of additional health indicators to include.
validator | boolean | true | Whether this microservice should use the NestJS &#x60;ValidationPipe&#x60;.
platform | string | express | 
port | number |  | The default port number where the server will listen.
apiPrefix |  |  | 
sentryDsn | string |  | The default Sentry DSN for error tracking.
overwrite | boolean | false | Whether to overwrite existing files, if any.
jwt | boolean | false | Whether the microservice should use JWT for authentication.
openApi | boolean | false | Whether the microservice should use an OpenAPI client.
apiConfigurationFile | string |  | The path to the API configuration file.
standalone | boolean | false | Whether the NestJS service should be standalone (without a module).

## feature-microservice
> feature-microservice generator

```bash
nx g @rxap/plugin-nestjs:feature-microservice
```

Option | Type | Default | Description
--- | --- | --- | ---
feature | string |  | The name of the frontend feature project.
sentry | boolean | true | Whether this service should use Sentry for error tracking.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after generation.
swagger | boolean | true | Whether this service should support Swagger/OpenAPI documentation generation.
swaggerLive | boolean | false | Whether this service should start a live Swagger server in development mode.
generateMain | boolean | false | Whether to generate the &#x27;main.ts&#x27; entry point file.
healthIndicator | boolean | true | Whether this service should include a health indicator endpoint.
healthIndicatorList | array |  | A list of specific health indicators to include.
validator | boolean | true | Whether this service should use the NestJS &#x27;ValidationPipe&#x27;.
platform | string | express | The underlying HTTP server platform to use.
port | number |  | The default port number for the microservice server.
sentryDsn | string |  | The default Sentry DSN for error reporting.
overwrite | boolean | false | Whether to overwrite existing files during generation.
jwt | boolean | false | Whether the application should use JWT authentication.
openApi | boolean | false | Whether the application should use an OpenAPI client.
apiConfigurationFile | string |  | The path to the API configuration file.
standalone | boolean | false | Whether the NestJS service should be a standalone application (not part of a larger monorepo structure).

## frontend-microservice
> frontend-microservice generator

```bash
nx g @rxap/plugin-nestjs:frontend-microservice
```

Option | Type | Default | Description
--- | --- | --- | ---
frontend | string |  | The name of the frontend project.
feature | string |  | The name of the frontend feature project.
sentry | boolean | true | Whether this service should use Sentry for error tracking.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after generation.
swagger | boolean | true | Whether this service should support Swagger/OpenAPI documentation generation.
swaggerLive | boolean | false | Whether this service should start a live Swagger server in development mode.
generateMain | boolean | false | Whether to generate the &#x27;main.ts&#x27; entry point file.
healthIndicator | boolean | true | Whether this service should include a health indicator endpoint.
healthIndicatorList | array |  | A list of specific health indicators to include.
validator | boolean | true | Whether this service should use the NestJS &#x27;ValidationPipe&#x27;.
platform | string | express | The underlying HTTP server platform to use.
port | number |  | The default port number for the microservice server.
sentryDsn | string |  | The default Sentry DSN for error reporting.
overwrite | boolean | false | Whether to overwrite existing files during generation.
jwt | boolean | false | Whether the application should use JWT authentication.
openApi | boolean | false | Whether the application should use an OpenAPI client.
apiConfigurationFile | string |  | The path to the API configuration file.
standalone | boolean | false | Whether the NestJS service should be a standalone application (not part of a larger monorepo structure).

## dynamic-configuration-module
> Extends the module with the dynamic configuration module pattern

```bash
nx g @rxap/plugin-nestjs:dynamic-configuration-module
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to add the dynamic configuration module to.
overwrite | boolean | false | Whether to overwrite existing files.
name | string |  | The name of the module. Defaults to the project name.
isGlobal | boolean | true | Whether the configuration module should be registered globally.
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

