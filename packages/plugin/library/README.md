This package provides generators and executors for managing and maintaining Nx plugin libraries. It includes functionality for generating index exports, fixing dependencies, generating JSON schemas, and more. It helps streamline the development process for Nx plugins by automating common tasks and enforcing best practices.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-library?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-library)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-library)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-library)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-library)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
  - [fix-dependencies](#fix-dependencies)
  - [index-export](#index-export)
  - [init-plugin](#init-plugin)
  - [init-buildable](#init-buildable)
  - [init-publishable](#init-publishable)
  - [expose-as-schematic](#expose-as-schematic)
  - [bundle-json-schema](#bundle-json-schema)
  - [index-json-schema](#index-json-schema)
  - [init-with-migrations](#init-with-migrations)
  - [add-migration](#add-migration)
  - [init-preset](#init-preset)
  - [init-schematic](#init-schematic)
- [Executors](#executors)
  - [update-dependencies](#update-dependencies)
  - [update-package-group](#update-package-group)
  - [readme](#readme)
  - [run-generator](#run-generator)
  - [check-version](#check-version)
  - [node-modules-linking](#node-modules-linking)
  - [index-export](#index-export)
  - [bundle-json-schema](#bundle-json-schema)
  - [index-json-schema](#index-json-schema)
  - [expose-as-schematic](#expose-as-schematic)
  - [fix-dependencies](#fix-dependencies)
  - [generate-schema](#generate-schema)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-library
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-library:init
```
# Generators

## init
> Create and update configurations to use rxap package publish concept

```bash
nx g @rxap/plugin-library:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the library project to initialize.
projects | array |  | The list of library projects to initialize.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
indexExport | boolean |  | Whether to add the &#x27;index-export&#x27; target to the library project configuration.
targets | object |  | Configuration for specific project targets.
withInitGenerator | boolean | false | Whether to generate an &#x27;init&#x27; generator within the library itself.

## fix-dependencies
> Adds missing dependencies and removes redudant dependencies of a project

```bash
nx g @rxap/plugin-library:fix-dependencies
```

Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | The list of projects to fix dependencies for.
reset | boolean |  | Whether to reset the project&#x27;s dependencies before fixing them.
resolve | boolean |  | Whether to resolve dependency versions from the workspace root &#x27;package.json&#x27;.
resetAll | boolean |  | Whether to reset all project dependencies, including peer dependencies.
strict | boolean | false | Whether to fail if any required dependency cannot be found in the workspace.
onlyDependencies | boolean | false | Whether to move all peer dependencies to the regular dependencies section.
dependencies | array |  | A list of package names that should always be added to the &#x27;dependencies&#x27; section.
peerDependencies | array |  | A list of package names that should always be added to the &#x27;peerDependencies&#x27; section.

## index-export
> Generate index exports for each directory and in the src root

```bash
nx g @rxap/plugin-library:index-export
```

Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | The list of projects to generate index exports for.
project | string |  | The name of a single project to generate an index export for.
generateRootExport | boolean | true | Whether to generate an &#x27;index.ts&#x27; file in the source root of the project.
additionalEntryPoints | array |  | A list of additional sub-directory entry points to include in the index export.

## init-plugin
> init-plugin generator

```bash
nx g @rxap/plugin-library:init-plugin
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to initialize as an Nx plugin.
projects | array |  | The list of projects to initialize as Nx plugins.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.

## init-buildable
> init-buildable generator

```bash
nx g @rxap/plugin-library:init-buildable
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the buildable library project to initialize.
projects | array |  | The list of buildable library projects to initialize.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.

## init-publishable
> init-publishable generator

```bash
nx g @rxap/plugin-library:init-publishable
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the library project to initialize for publishing.
projects | array |  | The list of library projects to initialize for publishing.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
targets | object |  | Configuration for specific project targets.
withInitGenerator | boolean | false | Whether to generate an &#x27;init&#x27; generator within the library itself.

## expose-as-schematic
> expose-as-schematic generator

```bash
nx g @rxap/plugin-library:expose-as-schematic
```

Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | The list of projects to expose as schematics.
project | string |  | The name of a single project to expose as a schematic.

## bundle-json-schema
> bundle-json-schema generator

```bash
nx g @rxap/plugin-library:bundle-json-schema
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project whose JSON schemas should be bundled.

## index-json-schema
> index-json-schema generator

```bash
nx g @rxap/plugin-library:index-json-schema
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project whose JSON schemas should be indexed.

## init-with-migrations
> init-with-migrations generator

```bash
nx g @rxap/plugin-library:init-with-migrations
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the library project to initialize with migrations support.
projects | array |  | The list of library projects to initialize with migrations support.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.

## add-migration
> add-migration generator

```bash
nx g @rxap/plugin-library:add-migration
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to add the migration to.
name | string |  | The name of the migration file.
description | string |  | A brief description of what the migration does.
packageVersion | string |  | The package version that triggers this migration.
packageJsonUpdates | boolean | false | Whether to include &#x27;package.json&#x27; dependency updates in the migration.
increment | string |  | The type of version increment for the &#x27;package.json&#x27; file.

## init-preset
> init-preset generator

```bash
nx g @rxap/plugin-library:init-preset
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the library project to initialize with a preset.
projects | array |  | The list of library projects to initialize with a preset.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.

## init-schematic
> init-schematic generator

```bash
nx g @rxap/plugin-library:init-schematic
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to initialize as a schematic library.
projects | array |  | The list of projects to initialize as schematic libraries.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
# Executors

## update-dependencies
> Update the local dependencies in the dist package.json. Replaces the atarix with the current package version of local dependency


## update-package-group
> Update the packageGroup array with all direct depedent projects


Option | Type | Default | Description
--- | --- | --- | ---
packageGroupRegex | array | @rxap/,@angular/,@nx/,@nestjs/,@sentry/ | List of regexes to match package name that should be added to the package group
merge | boolean | false | If true, the package group will be merged with the existing package group. If false, the package group will be replaced.
include | array |  | List of package names that should be added to the package group
includeDependencies | boolean | false | If true, the dependencies of the included packages will be added to the package group

## readme
> Readme generator for libraries.


## run-generator
> Executes a generator for the project


Option | Type | Default | Description
--- | --- | --- | ---
generator | string |  | Name of the generate to execute
options | object |  | Options to pass to the generator
withoutProjectArgument | boolean |  | If true, the project argument will not be passed to the generator
dryRun | boolean |  | If true, the generator will be executed in dry run mode
verbose | boolean |  | If true, the generator will be executed in verbose mode

## check-version
> check-version executor


Option | Type | Default | Description
--- | --- | --- | ---
packageName | string |  | The name of the package used as minimum version reference

## node-modules-linking
> node-modules-linking executor


## index-export
> index-export executor


Option | Type | Default | Description
--- | --- | --- | ---
generateRootExport | boolean | true | Generate index.ts in the source root of the project

## bundle-json-schema
> bundle-json-schema executor


## index-json-schema
> index-json-schema executor


## expose-as-schematic
> expose-as-schematic executor


## fix-dependencies
> fix-dependencies executor


Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | 
reset | boolean |  | 
resolve | boolean |  | 
resetAll | boolean |  | 
strict | boolean | false | If true, will fail if any dependency is not found
onlyDependencies | boolean | false | If true, will move all peer dependencies to dependencies
dependencies | array |  | List of packages that should always be added as dependencies
peerDependencies | array |  | List of packages that should always be added as peerDependencies

## generate-schema
> Generates the schema.d.ts file for each schema.json file for the given project


Option | Type | Default | Description
--- | --- | --- | ---
excludes | array |  | A list of glob patterns relative to the project that should be excluded

