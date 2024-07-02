# Application

## Standalone

Use the nx generate to create a new application:

```bash
NAME=app
nx g @nx/angular:application \
  --name=user-interface-$NAME \
  --addTailwind \
  --directory user-interface/$NAME \
  --projectNameAndRootFormat as-provided \
  --style scss \
  --tags angular
```

Initialize the application:

```bash
nx g @rxap/plugin-angular:init-application \
  --project user-interface-$NAME \
  --cleanup \
  --generateMain \
  --overwrite
```

## Feature Library

Use the nx generate to create a new feature library:

```bash
NAME=feature
nx g @nx/angular:library \
  --name=user-interface-feature-$NAME \
  --addTailwind \
  --buildable \
  --directory user-interface/feature/$NAME \
  --projectNameAndRootFormat as-provided \
  --style scss \
  --tags angular
``` 

Initialize the feature library:

```bash
nx g @rxap/plugin-angular:init-feature-library \
  --project user-interface-feature-$NAME \
  --overwrite \
  --routes
```

## Module Federation

### Host

Use the nx generate to create a new module federation host application:

```bash
NAME=host
nx g @nx/angular:host \
  --name=user-interface-$NAME \
  --addTailwind \
  --directory user-interface/$NAME \
  --dynamic \
  --projectNameAndRootFormat as-provided \
  --style scss \
  --tags angular
```

Initialize the module federation host application:

```bash
nx g @rxap/plugin-angular:init-application \
  --project user-interface-$NAME \
  --moduleFederation host \
  --cleanup \
  --generateMain \
  --overwrite
```

### Remote

Use the nx generate to create a new module federation remote application:

```bash
NAME=remote
nx g @nx/angular:remote \
  --host=user-interface-host \
  --name=user-interface-remote-$NAME \
  --addTailwind \
  --directory user-interface/remote/$NAME \
  --projectNameAndRootFormat as-provided \
  --style scss \
  --tags angular
```

Initialize the module federation remote application:

```bash
nx g @rxap/plugin-angular:init-application \
  --project user-interface-remote-$NAME \
  --host user-interface-host \
  --cleanup \
  --generateMain \
  --overwrite
```
