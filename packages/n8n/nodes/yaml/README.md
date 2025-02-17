This n8n node allows you to convert data to and from YAML format. It supports operations like extracting data from YAML, converting to YAML, and setting values within YAML structures. It also includes utilities for handling binary data and different encoding options.

[![npm version](https://img.shields.io/npm/v/@rxap/n8n-nodes-yaml?style=flat-square)](https://www.npmjs.com/package/@rxap/n8n-nodes-yaml)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/n8n-nodes-yaml)
![npm](https://img.shields.io/npm/dm/@rxap/n8n-nodes-yaml)
![NPM](https://img.shields.io/npm/l/@rxap/n8n-nodes-yaml)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/n8n-nodes-yaml
```
**Install peer dependencies:**
```bash
yarn add n8n-workflow@^1.48.0 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/n8n-nodes-yaml:init
```
# Guides

## Node Variants

### Extract From YAML

> Transform YAML data into output items

| Property                 | Default | Description                                                          |
|--------------------------|---------|----------------------------------------------------------------------|
| Input Binary Field       | `data`  | The name of the input field containing the file data to be processed |
| Destination Output Field | `data`  | The name of the output field that will contain the extracted data    |

### Convert to YAML

> Transform input data into YAML file

| Property                 | Default | Description                                            |
|--------------------------|---------|--------------------------------------------------------|
| Mode                     | once    | The operation mode                                     |
| Put Output File in Field | `data`  | The name of the output binary field to put the file in |

#### Modes

- **Once**: All Items to One File
- **each**: Each Item to Separate File

### JSON to YAML

> Converts data from JSON to YAML

| Property         | Default | Description                                                  |
|------------------|---------|--------------------------------------------------------------|
| Input Yaml Field | `data`  | Name of the property which contains the YAML data to convert |

### YAML to JSON

> Converts data from YAML to JSON

| Property                 | Default | Description                                                       |
|--------------------------|---------|-------------------------------------------------------------------|
| Input Json Field         | `data`  | Name of the property which contains the JSON data                 |
| Destination Output Field | `data`  | Name of the property to which to contains the converted YAML data |

### Set value in YAML

> Converts data from YAML to JSON

| Property         | Default | Description                                                                        |
|------------------|---------|------------------------------------------------------------------------------------|
| Input Yaml Field | `data`  | Name of the property which contains the YAML data to where the value should be set |
| Fields to Set    | `{}`    | Edit existing fields or add new ones to modify the output data                     |
| Input Type       | `auto`  | The type of the input data                                                         |

#### Input Types

- **auto**: Automatically detect the input type
- **string**: The input is a string
- **binary**: The input is a binary file

# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/n8n-nodes-yaml:init
```
