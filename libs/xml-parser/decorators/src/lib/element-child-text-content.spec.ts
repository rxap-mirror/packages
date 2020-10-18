import { getMetadata } from '@rxap/utilities';
import { XmlElementMetadata } from './utilities';
import {
  ElementChildTextContent,
  ElementChildTextContentParser
} from './element-child-text-content';

describe('@rxap/xml-parser/decorators', () => {

  describe('ElementChildTextContent', () => {

    describe('ElementChildTextContentParser', () => {

      it('should use parseValue function', () => {


        const parser = new ElementChildTextContentParser('property', { tag: 'tag', parseValue: Boolean });

        expect(parser.parse({} as any, { hasChild: () => true, getChildTextContent: () => 'true' } as any, {} as any))
          .toHaveProperty('property', true);

      });

    });

    describe('@ElementChildTextContent', () => {

      it('should add element parser to element metadata', () => {

        class MyElement {

          @ElementChildTextContent({ tag: 'my-child' })
          public name!: string;

        }

        const parser: any[] = getMetadata<any[]>(XmlElementMetadata.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[ 0 ]).toBe('function');

        const parserInstances = getMetadata<any[]>(XmlElementMetadata.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[ 0 ]).toBeInstanceOf(ElementChildTextContentParser);

      });

    });

  });

});
