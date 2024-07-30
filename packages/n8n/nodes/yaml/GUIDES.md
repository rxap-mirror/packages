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
