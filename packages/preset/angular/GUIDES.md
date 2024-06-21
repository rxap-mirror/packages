# Create a new workspace

To create a new workspace, run the following command:

```bash
WORKSPACE_NAME=my-workspace
yarn create nx-workspace --preset @rxap/preset-angular --pm yarn --name $WORKSPACE_NAME
```

Navigate to the newly created workspace and run the yarn install command:

```bash
cd $WORKSPACE_NAME
yarn
```
