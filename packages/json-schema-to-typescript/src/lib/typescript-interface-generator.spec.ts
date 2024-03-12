import { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';

describe('TypescriptInterfaceGenerator', () => {

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
