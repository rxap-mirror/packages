This package provides generators and executors for Angular projects within an Nx workspace. It helps initialize and configure Angular applications and libraries with Rxap-specific defaults and utilities. It also includes executors for tasks like checking ng-package configurations, managing application configurations, and generating i18n files.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-angular?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-angular)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-angular)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-angular)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-angular)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)
  - [init-application](#init-application)
  - [init-library](#init-library)
  - [fix-schematic](#fix-schematic)
  - [schematic](#schematic)
  - [init-feature](#init-feature)
  - [init-feature-library](#init-feature-library)
  - [init-component](#init-component)
  - [convert-to-buildable-library](#convert-to-buildable-library)
- [Executors](#executors)
  - [tailwind](#tailwind)
  - [check-ng-package](#check-ng-package)
  - [i18n](#i18n)
  - [config](#config)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-angular
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-angular:init
```
# Guides

# Application

## Standalone

Use the nx generate to create a new application:

```bash
NAME=app
nx g @nx/angular:application \
  --name=user-interface-$NAME \
  --addTailwind \
  --directory user-interface/$NAME \
  --projectNameAndRootFormat as-provided \
  --style scss \
  --tags angular
```

Initialize the application:

```bash
nx g @rxap/plugin-angular:init-application \
  --project user-interface-$NAME \
  --cleanup \
  --generateMain \
  --overwrite
```

## Feature Library

Use the nx generate to create a new feature library:

```bash
NAME=feature
nx g @nx/angular:library \
  --name=user-interface-feature-$NAME \
  --addTailwind \
  --buildable \
  --directory user-interface/feature/$NAME \
  --projectNameAndRootFormat as-provided \
  --style scss \
  --tags angular
``` 

Initialize the feature library:

```bash
nx g @rxap/plugin-angular:init-feature-library \
  --project user-interface-feature-$NAME \
  --overwrite \
  --routes
```

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
  --generateMain \
  --overwrite
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
  --generateMain \
  --overwrite
```

# Generators

## init
> init generator

```bash
nx g @rxap/plugin-angular:init
```

Option | Type | Default | Description
--- | --- | --- | ---
projects | array |  | The name of the projects to initialize.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipFormat | boolean | false | Whether to skip formatting files after initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
prefix | string |  | The prefix to use for the generated Angular components.
withSharedLibraries | boolean | false | Whether to initialize the workspace with shared libraries (components, forms, etc.).

## init-application
> init-application generator

```bash
nx g @rxap/plugin-angular:init-application
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to initialize.
projects | array |  | The list of projects to initialize.
incrementalBuild | boolean |  | Whether to enable incremental build for the project.
moduleFederation | string |  | The module federation role of the project.
layoutRoutePath | string |  | The route path for layout children components.
standaloneImport | boolean |  | Whether to import the MFE remote as a standalone unit.
skipDocker | boolean |  | Whether to skip the docker configuration
host | string |  | Host project for module federation
deploy | string |  | Add target to deploy to after build
sentry | boolean | true | 
apiStatusCheck | boolean | false | Whether to enable API status check during bootstrap.
authentication |  |  | 
openApi | boolean | false | Whether to enable OpenAPI
openApiLegacy | boolean |  | Whether to use the legacy OpenAPI client generation method.
config | boolean | true | Whether to enable configuration
localazy | boolean | false | Whether to enable Localazy
i18n | boolean | false | Whether to enable i18n
serviceWorker | boolean | true | Whether to enable service worker
languages | array |  | The list of supported languages for the application.
material | boolean | true | Whether to enable Angular Material
generateMain | boolean |  | Whether to generate the main.ts entry file.
overwrite | boolean |  | Whether to overwrite existing files
cleanup | boolean | true | Whether to cleanup files
i18nStandalone | boolean | false | Whether to compile each language into a separate application
monolithic | boolean | true | Whether to generate a monolithic application
localazyReadKey | string |  | Localazy read key
authentik | boolean |  | Use authentik for authentication
oauth | boolean |  | Use OAuth for authentication
skipProjects | boolean |  | Whether to skip executing project specific initialization
skipFormat | boolean |  | Whether to skip formatting files with Prettier after initialization.
coerce |  |  | Configuration coercion options for the project.

## init-library
> init-library generator

```bash
nx g @rxap/plugin-angular:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the library project to initialize.
projects | array |  | The list of library projects to initialize.
overwrite | boolean | false | Whether to overwrite existing files
skipProjects | boolean | false | Whether to skip executing project specific initialization
skipFormat | boolean | false | 
indexExport | boolean | true | Whether to add the &#x27;index-export&#x27; target to the library.
coerce |  | true | 
targets | object |  | Target configuration options for the library.

## fix-schematic
> fix-schematic generator

```bash
nx g @rxap/plugin-angular:fix-schematic
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to fix schematics for.

## schematic
> Create a Schematic for a project.

```bash
nx g @rxap/plugin-angular:schematic
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project where the schematic should be added.
name | string |  | The name of the schematic to create.
description | string |  | A brief description of what the schematic does.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after schematic creation.

## init-feature
> init-feature generator

```bash
nx g @rxap/plugin-angular:init-feature
```

Option | Type | Default | Description
--- | --- | --- | ---
name | string |  | The name of the feature to initialize.
project | string |  | The name of the project where the feature should be added.
overwrite | boolean |  | Whether to overwrite the feature if it already exists.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
apiStatusCheck | boolean | false | Whether to enable API status check for this feature.
navigation | object |  | 

## init-feature-library
> init-feature-library generator

```bash
nx g @rxap/plugin-angular:init-feature-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the feature library project to initialize.
projects | array |  | The list of feature library projects to initialize.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
routes | boolean | true | Whether the feature library should expose Angular routes.
targets | object |  | Target configuration options for the feature library.

## init-component
> init-component generator

```bash
nx g @rxap/plugin-angular:init-component
```

Option | Type | Default | Description
--- | --- | --- | ---
directory | string |  | The directory at which to create the component file, relative to the current workspace. Default is a folder with the same name as the component in the project root.
feature | string |  | The name of the feature the component belongs to.
project | string |  | The name of the project.
name | string |  | The name of the component.
prefix | string |  | The prefix to apply to the generated component selector.
displayBlock | boolean | false | Specifies if the style will contain &#x60;:host { display: block; }&#x60;.
inlineStyle | boolean | false | Include styles inline in the component.ts file. Only CSS styles can be included inline. By default, an external styles file is created and referenced in the component.ts file.
inlineTemplate | boolean | false | Include template inline in the component.ts file. By default, an external template file is created and referenced in the component.ts file.
standalone | boolean | true | Whether the generated component is standalone. _Note: This is only supported in Angular versions &gt;&#x3D; 14.1.0_.
viewEncapsulation | string |  | The view encapsulation strategy to use in the new component.
changeDetection | string | OnPush | The change detection strategy to use in the new component.
module | string |  | The filename or path to the NgModule that will declare this component.
style | string | scss | The file extension or preprocessor to use for style files, or &#x60;none&#x60; to skip generating the style file.
skipTests | boolean | false | Do not create &#x60;spec.ts&#x60; test files for the new component.
flat | boolean | false | Create the new files at the top level of the current project.
skipImport | boolean | false | Do not import this component into the owning NgModule.
selector | string |  | The HTML selector to use for this component.
skipSelector | boolean | false | Specifies if the component should have a selector or not.
type | string | component | Adds a developer-defined type to the filename, in the format &#x60;name.type.ts&#x60;.
defaultExport | boolean | false | Whether the component class should be the default export of the file.
export | boolean | false | Whether the component should be exported from the declaring NgModule or project entry point.
skipFormat | boolean | false | Skip formatting files.
interactionTests | boolean | true | Whether to set up Storybook interaction tests for the component.
cypressProject | string |  | The Cypress project to generate the stories under. By default, inferred from &#x60;projectName&#x60;.
specDirectory | string |  | Directory where to place the generated spec file. By default matches the value of the &#x60;componentPath&#x60; option.

## convert-to-buildable-library
> convert-to-buildable-library generator

```bash
nx g @rxap/plugin-angular:convert-to-buildable-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to convert to a buildable library.
# Executors

## tailwind
> tailwind executor


Option | Type | Default | Description
--- | --- | --- | ---
config | string | tailwind.config.js | 
input | string | src/styles/theme.scss | 
output | string | theme.css | 
minify | boolean | false | 

## check-ng-package
> check-ng-package executor


## i18n
> i18n executor


Option | Type | Default | Description
--- | --- | --- | ---
availableLanguages | array |  | 
defaultLanguage | string |  | 
indexHtmlTemplate | string | i18n.index.html.hbs | 
buildTarget | string |  | 
assets |  |  | 

## config
> config executor


