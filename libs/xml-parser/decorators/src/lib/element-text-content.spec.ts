import { getMetadata } from '@rxap/utilities';
import { XmlElementMetadata } from './utilities';
import {
  ElementTextContent,
  ElementTextContentParser
} from './element-text-content';
import {
  XmlParserService,
  RxapElement
} from '@rxap/xml-parser';
import { compile } from 'handlebars';

describe('@rxap/xml-parser/decorators', () => {

  describe('ElementTextContent', () => {

    describe('ElementTextContentParser', () => {

      const xmlParser: XmlParserService = {} as any;

      it('should not set parsed element property if attribute is not present and if not required and no default value is defined', () => {

        const parser = new ElementTextContentParser('property', {});

        expect(parser.parse(xmlParser, { getTextContent: () => '' } as any, {} as any)).toHaveProperty('property');

      });

      it('should throw if element attribute is not present and if required', () => {

        const parser = new ElementTextContentParser('property', { required: true });

        expect(() => parser.parse(xmlParser, { getTextContent: () => '' } as any, {} as any)).not.toThrowError();

      });

      it('should set parsed element property with default value if attribute is not present', () => {

        const parser = new ElementTextContentParser('property', { defaultValue: 'my-default-value' });

        expect(parser.parse(xmlParser, { getTextContent: () => '' } as any, {} as any)).toHaveProperty('property', 'my-default-value');

      });

      it('should not throw if element attribute is not present and if required had have defined default property', () => {

        const parser = new ElementTextContentParser('property', { required: true, defaultValue: 'my-default-value' });

        expect(() => parser.parse(xmlParser, { getTextContent: () => '' } as any, {} as any)).not.toThrowError();

        expect(parser.parse(xmlParser, { getTextContent: () => '' } as any, {} as any)).toHaveProperty('property', 'my-default-value');

      });

      it('should use default value parse if attribute is present and no value parse is defined', () => {

        const parser = new ElementTextContentParser('property', {});

        const element: RxapElement = { getTextContent: () => '' } as any;

        const elementGetSpy = spyOn(element, 'getTextContent');

        elementGetSpy.and.returnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'my-value');

        elementGetSpy.and.returnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '');

        elementGetSpy.and.returnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', false);

        elementGetSpy.and.returnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.and.returnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', -1);

        elementGetSpy.and.returnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 1);

        elementGetSpy.and.returnValue('"true"');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'true');

        elementGetSpy.and.returnValue('\'true\'');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'true');

        elementGetSpy.and.returnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', {});

        elementGetSpy.and.returnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', []);

      });

      it('should use Number() as parser', () => {

        const parser = new ElementTextContentParser('property', { parseValue: Number });

        const element: RxapElement = { getTextContent: () => '' } as any;

        const elementGetSpy = spyOn(element, 'getTextContent');

        elementGetSpy.and.returnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.and.returnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.and.returnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.and.returnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.and.returnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.and.returnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.and.returnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.and.returnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 1);

        elementGetSpy.and.returnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', -1);

      });

      it('should use String() as parser', () => {

        const parser = new ElementTextContentParser('property', { parseValue: String });

        const element: RxapElement = { getTextContent: () => '' } as any;

        const elementGetSpy = spyOn(element, 'getTextContent');

        elementGetSpy.and.returnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'my-value');

        elementGetSpy.and.returnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'true');

        elementGetSpy.and.returnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'false');

        elementGetSpy.and.returnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '[]');

        elementGetSpy.and.returnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '{}');

        elementGetSpy.and.returnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '0');

        elementGetSpy.and.returnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '1');

        elementGetSpy.and.returnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '-1');

        elementGetSpy.and.returnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '');

      });

      it('should use Boolean() as parser', () => {

        const parser = new ElementTextContentParser('property', { parseValue: Boolean });

        const element: RxapElement = { getTextContent: () => '' } as any;

        const elementGetSpy = spyOn(element, 'getTextContent');

        elementGetSpy.and.returnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', false);

      });

      it('should use Array() as parser', () => {

        const parser = new ElementTextContentParser('property', { parseValue: Array });

        const element: RxapElement = { getTextContent: () => '' } as any;

        const elementGetSpy = spyOn(element, 'getTextContent');

        elementGetSpy.and.returnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ 'my-value' ]);

        elementGetSpy.and.returnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ 'true' ]);

        elementGetSpy.and.returnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ 'false' ]);

        elementGetSpy.and.returnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '[]' ]);

        elementGetSpy.and.returnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '{}' ]);

        elementGetSpy.and.returnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '0' ]);

        elementGetSpy.and.returnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '1' ]);

        elementGetSpy.and.returnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '-1' ]);

        elementGetSpy.and.returnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '' ]);

      });

      it('should use Array() as parser', () => {

        const parser = new ElementTextContentParser('property', { parseValue: JSON.parse });

        const element: RxapElement = { getTextContent: () => '' } as any;

        const elementGetSpy = spyOn(element, 'getTextContent');

        elementGetSpy.and.returnValue('my-value');
        expect(() => parser.parse(xmlParser, element, {} as any)).toThrowError();

        elementGetSpy.and.returnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.and.returnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', false);

        elementGetSpy.and.returnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', []);

        elementGetSpy.and.returnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', {});

        elementGetSpy.and.returnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.and.returnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 1);

        elementGetSpy.and.returnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', -1);

        elementGetSpy.and.returnValue('');
        expect(() => parser.parse(xmlParser, element, {} as any)).toThrowError();

      });

      it('should use Handlebars.compile as parser', () => {

        const parser = new ElementTextContentParser('property', { parseValue: compile });

        const element: RxapElement = { getTextContent: () => '' } as any;

        const elementGetSpy = spyOn(element, 'getTextContent');
        elementGetSpy.and.returnValue('my-value');
        const parsedElement: any = parser.parse(xmlParser, element, {} as any);
        expect(parsedElement).toHaveProperty('property');
        expect(typeof parsedElement.property).toEqual('function');

      });

    });

    describe('@ElementTextContent', () => {

      it('should add element parser to element metadata', () => {

        class MyElement {

          @ElementTextContent()
          public text!: string;

        }

        const parser: any[] = getMetadata<any[]>(XmlElementMetadata.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[ 0 ]).toBe('function');

        const parserInstances = getMetadata<any[]>(XmlElementMetadata.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[ 0 ]).toBeInstanceOf(ElementTextContentParser);

      });

    });

  });

});
