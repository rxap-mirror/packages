# Release Workflow

## Bump version of packages

To bump the version of packages, run the command:

```shell
yarn lerna version
```

### Lifecycle Scripts

**preversion(root)**: The target `fix-dependencies` is run for each project and the for each project the target `build`, `test`, `lint` is run. If the build fails, the version is not bumped.

**prepublishOnly(root)**: The target `build` with the configuration `production` is run for each project 

**version(root)**: The target `update-dependencies` and `update-package-group` is run for each project and The target `readme` for the root project `packages` is run
