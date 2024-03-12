import { JSONSchema } from '@apidevtools/json-schema-ref-parser';
import { TypescriptInterfaceGenerator } from '@rxap/json-schema-to-typescript';

describe('TypescriptInterfaceGenerator', () => {

  it('should generate an interface with enum properties', async () => {

    const schema: JSONSchema = {
      'properties': {
        'order': {
          'description': 'Sort descending or ascending.',
          'enum': [
            'desc',
            'asc',
          ],
          'example': 'desc',
          'type': 'string',
        },
        'page': {
          'default': 1,
          'description': 'The page number.',
          'example': '0',
          'type': 'integer',
        },
        'pages': {
          'description': 'The total amount of retrievable pages.',
          'example': '132',
          'readOnly': true,
          'type': 'integer',
        },
        'per_page': {
          'default': 10,
          'description': 'The amount of items per page.',
          'example': '10',
          'type': 'integer',
        },
        'sort': {
          'description': 'The field that determines the order.',
          'example': 'name',
          'type': 'string',
        },
        'total': {
          'description': 'The total amount of retrievable items.',
          'example': '132',
          'readOnly': true,
          'type': 'integer',
        },
      },
      'type': 'object',
    };

    const generator = new TypescriptInterfaceGenerator(schema);

    const result = await generator.build('MyInterface');

    console.log(result.getFullText());

  });

});
