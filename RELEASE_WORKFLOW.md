# Release Workflow

## Bump version of packages

To bump the version of packages, run the command:

```shell
yarn lerna version
```

### Lifecycle Scripts

**preversion(root)**: For each project the target `build`, `test`, `lint` is run. If the build fails, the version is not
bumped.
**version(package)**: The target `update-dependencies` and `update-package-group` is run for the project
**prepublishOnly(package)**: The target `build` with configuration `production` is run for the project
