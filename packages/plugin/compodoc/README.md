This Nx plugin generates documentation for Angular, NestJS and other TypeScript projects using Compodoc. It provides executors to build and serve the documentation, as well as generators to initialize Compodoc in your projects. The plugin automates the configuration of tsconfig files and gitignore files for Compodoc.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-compodoc?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-compodoc)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-compodoc)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-compodoc)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-compodoc)

- [Installation](#installation)
- [Generators](#generators)
  - [init](#init)
  - [init-library](#init-library)
  - [init-application](#init-application)
- [Executors](#executors)
  - [build](#build)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-compodoc
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-compodoc:init
```
# Generators

## init
> init generator

```bash
nx g @rxap/plugin-compodoc:init
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to initialize Compodoc for.
projects | array |  | The list of projects to initialize Compodoc for.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.

## init-library
> init-library generator

```bash
nx g @rxap/plugin-compodoc:init-library
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the library project to initialize Compodoc for.
projects | array |  | The list of library projects to initialize Compodoc for.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.

## init-application
> init-application generator

```bash
nx g @rxap/plugin-compodoc:init-application
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the application project to initialize Compodoc for.
projects | array |  | The list of application projects to initialize Compodoc for.
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
overwrite | boolean | false | Whether to overwrite existing files during initialization.
skipProjects | boolean | false | Whether to skip executing project-specific initialization logic.
# Executors

## build
> build executor


Option | Type | Default | Description
--- | --- | --- | ---
tsConfig | string |  | Path to project&#x27;s TypeScript configuration file. (default: &#x60;&lt;projectRoot&gt;/tsconfig.json&#x60;)
outputPath |  |  | The output path of the generated files. (default: &#x60;dist/compodoc/&lt;projectName&gt;&#x60;)
exportFormat | string | html | Format of generated documentation: html, json (json implicitly enables Compodoc&#x27;s &#x60;minimal&#x60; mode)
name | string |  | Title of the documentation.
includes | string |  | Path to external markdown files, folder should contain a summary.json.
includesName | string |  | Name of menu item containing external markdown files.
assetsFolder | string |  | External assets folder to copy in generated documentation folder.
unitTestCoverage | string |  | Path to unit test coverage in json-summary format.
disableCoverage | boolean | true | Do not add the documentation coverage report.
disableSourceCode | boolean | false | Do not add source code tab and links to source code.
disableDomTree | boolean | false | Do not add dom tree tab.
disableTemplateTab | boolean | false | Do not add template tab.
disableStyleTab | boolean | false | Do not add style tab.
disableGraph | boolean | false | Disable rendering of the dependency graph.
disablePrivate | boolean | true | Do not show private in generated documentation.
disableProtected | boolean | false | Do not show protected in generated documentation.
disableInternal | boolean | true | Do not show @internal in generated documentation.
disableLifeCycleHooks | boolean | true | Do not show Angular lifecycle hooks in generated documentation.
disableRoutesGraph | boolean | false | Do not add the routes graph.
disableSearch | boolean | false | Do not add the search input.
disableDependencies | boolean | false | Do not add the dependencies list.
coverageTest | integer | 0 | Threshold for global documentation coverage.
coverageMinimumPerFile | integer | 0 | Threshold for documentation coverage of each file.
coverageTestThresholdFail | boolean | true | bort compodoc with an error instead of a warn log, if coverage threshold (global or per file) is not reached (true: error, false: warn).
language | string | en-US | Language used for generated documentation.
theme | string | gitbook | Theme used for generated documentation.
extTheme | string |  | Path to external theme file.
templates | string |  | Path to directory of Handlebars templates to override built-in templates.
customLogo | string |  | Path to custom logo.
customFavicon | string |  | Path to custom favicon.
hideGenerator | boolean | false | Do not print the Compodoc logo at the bottom of the page.
serve | boolean |  | Serve generated documentation.
port | number | 8080 | Port for serving of documentation. (default: 8080)
watch | boolean | false | Watch for source files changes to automatically rebuild documentation.
silent | boolean |  | Suppress verbose build output.
debug | boolean | false | Show executor logs like compodoc command with arguments and working directory.

