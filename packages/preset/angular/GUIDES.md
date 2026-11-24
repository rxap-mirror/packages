# Create a new workspace

To create a new workspace, run the following command:

```bash
WORKSPACE_NAME=my-workspace
npx create-nx-workspace --preset @rxap/preset-angular --pm pnpm --name $WORKSPACE_NAME
```

`--pm` selects the package manager (`npm`, `pnpm` or `yarn`); the workspace is set up for it and the dependencies
are installed. Navigate to the newly created workspace:

```bash
cd $WORKSPACE_NAME
```
