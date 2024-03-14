import { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';

describe('TypescriptInterfaceGenerator', () => {

  it('should generate an interface with union types', async () => {

    const schema: JSONSchema = {
      components: {
        schemas: {
          "Layout": {
            "type": "object",
            "properties": {
              "uuid": {
                "type": "string",
                "format": "uuid"
              },
              "companyUuid": {
                "type": "string",
                "format": "uuid"
              },
              "name": {
                "type": "string"
              },
              "widgets": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Widget"
                }
              },
              "type": {
                "type": "string",
                "enum": [
                  "0",
                  "1"
                ]
              },
              "tabLayouts": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/Layout"
                }
              },
              "removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__updatedBy": {
                "type": "string"
              },
              "__updatedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__archived": {
                "type": "boolean"
              },
              "deletedAt": {
                "type": "integer",
                "format": "int64"
              },
              "updatedAt": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "Role": {
            "type": "object",
            "properties": {
              "uuid": {
                "type": "string",
                "format": "uuid"
              },
              "name": {
                "type": "string"
              },
              "value": {
                "type": "integer",
                "format": "int64"
              },
              "primaryRoleUserUuid": {
                "type": "string",
                "format": "uuid"
              }
            }
          },
          "Widget": {
            "type": "object",
            "properties": {
              "uuid": {
                "type": "string",
                "format": "uuid"
              },
              "label": {
                "type": "string"
              },
              "x": {
                "type": "integer",
                "format": "int32"
              },
              "y": {
                "type": "integer",
                "format": "int32"
              },
              "type": {
                "type": "string"
              },
              "width": {
                "type": "integer",
                "format": "int32"
              },
              "height": {
                "type": "integer",
                "format": "int32"
              },
              "value": {
                "type": "string"
              },
              "additionalTag": {
                "type": "string"
              },
              "time": {
                "type": "string"
              },
              "min": {
                "type": "number",
                "format": "float"
              },
              "max": {
                "type": "number",
                "format": "float"
              },
              "color": {
                "type": "string",
                "deprecated": true
              },
              "dataDefinitionKeyItemName": {
                "type": "string"
              },
              "imageProperties": {
                "$ref": "#/components/schemas/ImageProperties"
              },
              "colorList": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/StringKeyValueMapping"
                }
              },
              "intervalInS": {
                "type": "integer",
                "format": "int32"
              },
              "maxTest": {
                "type": "number",
                "format": "float"
              },
              "optionalIntValue1": {
                "type": "integer",
                "format": "int32"
              },
              "optionalIntValue2": {
                "type": "integer",
                "format": "int32"
              },
              "thingUuid": {
                "type": "string",
                "format": "uuid"
              },
              "machineUuid": {
                "type": "string",
                "format": "uuid"
              },
              "machineName": {
                "type": "string"
              },
              "thingName": {
                "type": "string"
              },
              "archived": {
                "type": "boolean"
              },
              "removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__updatedBy": {
                "type": "string"
              },
              "__updatedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__archived": {
                "type": "boolean"
              },
              "dataDefinitionKeyItemUuid": {
                "type": "string",
                "format": "uuid"
              },
              "deletedAt": {
                "type": "integer",
                "format": "int64"
              },
              "updatedAt": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "StringKeyValueMapping": {
            "type": "object",
            "properties": {
              "uuid": {
                "type": "string",
                "format": "uuid"
              },
              "keyLabel": {
                "type": "string"
              },
              "value": {
                "type": "string"
              },
              "removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__updatedBy": {
                "type": "string"
              },
              "__updatedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__archived": {
                "type": "boolean"
              },
              "deletedAt": {
                "type": "integer",
                "format": "int64"
              },
              "updatedAt": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "ImageProperties": {
            "type": "object",
            "properties": {
              "uuid": {
                "type": "string",
                "format": "uuid"
              },
              "value1": {
                "type": "string",
                "deprecated": true
              },
              "value2": {
                "type": "string",
                "deprecated": true
              },
              "value3": {
                "type": "string",
                "deprecated": true
              },
              "value4": {
                "type": "string",
                "deprecated": true
              },
              "value5": {
                "type": "string",
                "deprecated": true
              },
              "scaling": {
                "type": "string"
              },
              "values": {
                "type": "array",
                "items": {
                  "$ref": "#/components/schemas/ImagePropertiesValue"
                }
              },
              "removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__updatedBy": {
                "type": "string"
              },
              "__updatedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__archived": {
                "type": "boolean"
              },
              "deletedAt": {
                "type": "integer",
                "format": "int64"
              },
              "updatedAt": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
          "ImagePropertiesValue": {
            "type": "object",
            "properties": {
              "uuid": {
                "type": "string",
                "format": "uuid"
              },
              "keyLabel": {
                "type": "string",
                "writeOnly": true
              },
              "value": {
                "type": "string"
              },
              "key": {
                "type": "string"
              },
              "removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__updatedBy": {
                "type": "string"
              },
              "__updatedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__removedAt": {
                "type": "integer",
                "format": "int64"
              },
              "__archived": {
                "type": "boolean"
              },
              "deletedAt": {
                "type": "integer",
                "format": "int64"
              },
              "updatedAt": {
                "type": "integer",
                "format": "int64"
              }
            }
          },
        }
      },
      "type": "object",
      "properties": {
        "uuid": {
          "type": "string",
          "format": "uuid"
        },
        "username": {
          "type": "string"
        },
        "activationKey": {
          "type": "string"
        },
        "activationKeyCreationTime": {
          "type": "integer",
          "format": "int64"
        },
        "activated": {
          "type": "boolean"
        },
        "enabled": {
          "type": "boolean"
        },
        "roles": {
          "type": "array",
          "items": {
            "$ref": "#/components/schemas/Role"
          }
        },
        "firebaseRegistrationToken": {
          "type": "string"
        },
        "firebaseWebAppMessageToken": {
          "type": "string"
        },
        "receiveMessages": {
          "type": "boolean"
        },
        "favouriteLayout": {
          "$ref": "#/components/schemas/Layout"
        },
        "privacyAccepted": {
          "type": "boolean"
        },
        "privacyAcceptedTimestamp": {
          "type": "integer",
          "format": "int64"
        },
        "desktopDesignMode": {
          "type": "string",
          "enum": [
            "0",
            "1"
          ]
        },
        "mobileDesignMode": {
          "type": "string",
          "enum": [
            "0",
            "1"
          ]
        },
        "userLanguage": {
          "type": "string",
          "enum": [
            "0",
            "1",
            "2",
            "3"
          ]
        },
        "receiveEmailMessages": {
          "type": "boolean"
        },
        "admin": {
          "type": "boolean"
        },
        "primaryRole": {
          "$ref": "#/components/schemas/Role"
        },
        "removedAt": {
          "type": "integer",
          "format": "int64"
        },
        "__updatedBy": {
          "type": "string"
        },
        "__updatedAt": {
          "type": "integer",
          "format": "int64"
        },
        "__removedAt": {
          "type": "integer",
          "format": "int64"
        },
        "__archived": {
          "type": "boolean"
        },
        "deletedAt": {
          "type": "integer",
          "format": "int64"
        },
        "updatedAt": {
          "type": "integer",
          "format": "int64"
        }
      }
    };

    const generator = new TypescriptInterfaceGenerator(schema, { addImports: true });

    await generator.bundleSchema();

    const result = generator.buildSync('MyInterface');

    console.log(result.getFullText());

  });

  it('should generate an interface with enum properties', async () => {

    const schema: JSONSchema = {
      components: {
        schemas: {
          "Filter": {
            "properties": {
              "column": {
                "description": "The column to filter.",
                "example": "uuid",
                "type": "string"
              },
              "value": {
                "description": "The value to filter.",
                "example": "a5"
              }
            },
            "type": "object"
          },
        }
      },
      "properties": {
        "filters": {
          "items": {
            "$ref": "#/components/schemas/Filter"
          },
          "type": "array"
        },
        "order": {
          "description": "Sort descending or ascending.",
          "enum": [
            "desc",
            "asc"
          ],
          "example": "desc",
          "type": "string"
        },
        "page": {
          "default": 1,
          "description": "The page number.",
          "example": "0",
          "type": "integer"
        },
        "pages": {
          "description": "The total amount of retrievable pages.",
          "example": "132",
          "readOnly": true,
          "type": "integer"
        },
        "per_page": {
          "default": 10,
          "description": "The amount of items per page.",
          "example": "10",
          "type": "integer"
        },
        "sort": {
          "description": "The field that determines the order.",
          "example": "name",
          "type": "string"
        },
        "total": {
          "description": "The total amount of retrievable items.",
          "example": "132",
          "readOnly": true,
          "type": "integer"
        }
      },
      "type": "object"
    };

    const generator = new TypescriptInterfaceGenerator(schema, { addImports: true });

    await generator.bundleSchema();

    const result = generator.buildSync('MyInterface');

    console.log(result.getFullText());

  });

});
