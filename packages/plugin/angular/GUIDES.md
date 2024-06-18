# Application

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
  --generateMain
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
  --generateMain
```
