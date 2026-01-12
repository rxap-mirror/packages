This package provides executors and generators for integrating Localazy, a translation management platform, into Nx workspaces. It allows for downloading and uploading translations, managing configuration, and initializing Localazy within a project. The plugin simplifies the process of localizing applications by automating common tasks related to translation management.

[![npm version](https://img.shields.io/npm/v/@rxap/plugin-localazy?style=flat-square)](https://www.npmjs.com/package/@rxap/plugin-localazy)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/plugin-localazy)
![npm](https://img.shields.io/npm/dm/@rxap/plugin-localazy)
![NPM](https://img.shields.io/npm/l/@rxap/plugin-localazy)

- [Installation](#installation)
- [Generators](#generators)
  - [config](#config)
  - [init](#init)
- [Executors](#executors)
  - [download](#download)
  - [upload](#upload)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/plugin-localazy
```
**Execute the init generator:**
```bash
yarn nx g @rxap/plugin-localazy:init
```
**Execute the config generator to use the package with a project:**
```bash
yarn nx g @rxap/plugin-localazy:config [project]
```
# Generators

## config
> Add the executor &#x27;localazy-download&#x27; and &#x27;localazy-upload&#x27; and update the nx.json file

```bash
nx g @rxap/plugin-localazy:config
```

Option | Type | Default | Description
--- | --- | --- | ---
project | string |  | The name of the project to add the Localazy builder to.
extractTarget | string |  | The Nx target responsible for extracting or generating the translation source files.
writeKey | string |  | The Localazy project write key. This key will be added to the .env file.
readKey | string |  | The Localazy project read key. This key will be added to the .env file.
overwrite | boolean | false | Whether to overwrite existing Localazy configuration files.

## init
> Initialize the package in the workspace

```bash
nx g @rxap/plugin-localazy:init
```

Option | Type | Default | Description
--- | --- | --- | ---
skipFormat | boolean | false | Whether to skip formatting files with Prettier after initialization.
# Executors

## download
> Downloads i18n files from localazy


Option | Type | Default | Description
--- | --- | --- | ---
readKey | string |  | Provide the writeKey on the command line.
writeKey | string |  | Provide the readkey on the command line.
keysJson | string |  | Override the keys file name.
configJson | string |  | Override the configuration file name.
workingDirectory | string |  | Set the working directory that all paths are relative to.
dryRun | boolean | false | Do not perform the actual operation, only simulate the process. No files are uploaded nor written.
quite | boolean | false | Quiet mode. Print only important information.
force | boolean | false | Force the upload operation if the validation step fails.
autoTag | boolean | false | Automatically determine a tag and perform the operation for it.
tag | string |  | Perform the operation for the given release tag.
branch | string |  | Perform the operation for the given branch
param | string |  | Add extra parameter for processing; format is key:value
failOnMissingGroups | boolean |  | Fail when non-existent group is provided on the command line

## upload
> Uploadss i18n files from localazy


Option | Type | Default | Description
--- | --- | --- | ---
readKey | string |  | Provide the writeKey on the command line.
writeKey | string |  | Provide the readkey on the command line.
keysJson | string |  | Override the keys file name.
configJson | string |  | Override the configuration file name.
workingDirectory | string |  | Set the working directory that all paths are relative to.
dryRun | boolean | false | Do not perform the actual operation, only simulate the process. No files are uploaded nor written.
version | string |  | 
quite | boolean | false | Quiet mode. Print only important information.
force | boolean | false | Force the upload operation if the validation step fails.
tag | string |  | Perform the operation for the given release tag.
autoTag | boolean | false | Automatically determine a tag and perform the operation for it.
extractTarget | string |  | The target that extracts or generate the translation source file.
disableContentLength | boolean |  | Disable Content-Length header when uploading data; use only when the upload  operation fails with &#x27;bad request&#x27;
async | boolean |  | Do not wait for the server to process the uploaded data and report errors.
project | string |  | Only perform upload if the project slug or ID match the specified one
branch | string |  | Perform the operation for the given branch
param | string |  | Add extra parameter for processing; format is key:value
failOnMissingGroups | boolean |  | Fail when non-existent group is provided on the command line

