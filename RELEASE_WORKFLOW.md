# Release Workflow

## Bump version of packages

To bump the version of packages, run the command:

```shell
yarn lerna version
```

### Lifecycle Scripts

**preversion(root)**: For each project the target `build`, `test`, `lint` is run. If the build fails, the version is not bumped.

**prepublishOnly(root)**: The target `build` with the configuration `production` is run for each project 

**version(root)**: The target `readme` for the root project `packages` is run

**version(package)**: The target `update-dependencies` and `update-package-group` is run for the project

**perversion(package)**: The generator `@rxap/plugin-library:fix-dependencies` with the strict option is run for the project
