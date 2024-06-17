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

Create a new generator with the following command:

```bash
nx g @nx/plugin:generator \
  --name=preset \
  --project=preset-$NAME \
  --nameAndDirectoryFormat=as-provided \
  --directory=packages/preset/$NAME/src/generators/preset
```
