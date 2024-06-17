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
