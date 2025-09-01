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
