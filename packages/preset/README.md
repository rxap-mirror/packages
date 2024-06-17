Preset
===

# Create a new preset package

Create a new plugin library package with the following command:

```bash
NAME=name
nx g @nx/plugin:plugin \
  --publishable \
  --name=preset-$NAME \
  --directory=packages/preset/$NAME \
  --tags=plugin,nx,nx-plugin,packages,preset \
  --projectNameAndRootFormat=as-provided \
  --importPath=@rxap/preset-$NAME
```

Run the init generator to initialize the project:

```bash
nx g @rxap/plugin-library:init --project=preset-$NAME
```

Add implicit dependencies to project used by the preset generator:

```json
{
  "implicitDependencies": [ "plugin-$NAME" ]
}
```
