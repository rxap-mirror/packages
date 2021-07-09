import {
  ElementAttributeParser,
  ElementAttribute
} from './element-attribute';
import {
  RxapElement,
  XmlParserService
} from '@rxap/xml-parser';
import { XmlElementMetadata } from './utilities';
import { compile } from 'handlebars';
import { getMetadata } from '@rxap/utilities/reflect-metadata';

describe('@rxap/xml-parser/decorators', () => {

  describe('ElementAttribute', () => {

    describe('ElementAttributeParser', () => {

      const xmlParser: XmlParserService = {} as any;

      it('should not set parsed element property if attribute is not present and if not required and no default value is defined', () => {

        const parser = new ElementAttributeParser('property', { attribute: 'attribute' });

        expect(parser.parse(xmlParser, { has: () => false } as any, {} as any)).not.toHaveProperty('property');

      });

      it('should throw if element attribute is not present and if required', () => {

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', required: true });

        expect(() => parser.parse(xmlParser, { has: () => false } as any, {} as any)).toThrowError();

      });

      it('should set parsed element property with default value if attribute is not present', () => {

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', defaultValue: 'my-default-value' });

        expect(parser.parse(xmlParser, { has: () => false } as any, {} as any)).toHaveProperty('property', 'my-default-value');

      });

      it('should not throw if element attribute is not present and if required had have defined default property', () => {

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', required: true, defaultValue: 'my-default-value' });

        expect(() => parser.parse(xmlParser, { has: () => false } as any, {} as any)).not.toThrowError();

        expect(parser.parse(xmlParser, { has: () => false } as any, {} as any)).toHaveProperty('property', 'my-default-value');

      });

      it('should use default value parse if attribute is present and no value parse is defined', () => {

        const parser = new ElementAttributeParser('property', { attribute: 'attribute' });

        const element: RxapElement = { has: () => true, get: () => 'value' } as any;

        const elementGetSpy = spyOn(element, 'get');

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

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', parseValue: Number });

        const element: RxapElement = { has: () => true, get: () => 'value' } as any;

        const elementGetSpy = spyOn(element, 'get');

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

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', parseValue: String });

        const element: RxapElement = { has: () => true, get: () => 'value' } as any;

        const elementGetSpy = spyOn(element, 'get');

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

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', parseValue: Boolean });

        const element: RxapElement = { has: () => true, get: () => 'value' } as any;

        const elementGetSpy = spyOn(element, 'get');

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

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', parseValue: Array });

        const element: RxapElement = { has: () => true, get: () => 'value' } as any;

        const elementGetSpy = spyOn(element, 'get');

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

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', parseValue: JSON.parse });

        const element: RxapElement = { has: () => true, get: () => 'value' } as any;

        const elementGetSpy = spyOn(element, 'get');

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

        const parser = new ElementAttributeParser('property', { attribute: 'attribute', parseValue: compile });

        const element: RxapElement = { has: () => true, get: () => 'value' } as any;

        const elementGetSpy = spyOn(element, 'get');
        elementGetSpy.and.returnValue('my-value');
        const parsedElement: any = parser.parse(xmlParser, element, {} as any);
        expect(parsedElement).toHaveProperty('property');
        expect(typeof parsedElement.property).toEqual('function');

      });

    });

    describe('@ElementAttribute', () => {

      it('should add element parser to element metadata', () => {

        class MyElement {

          @ElementAttribute({ attribute: 'name' })
          public name!: string;

        }

        const parser: any[] = getMetadata<any[]>(XmlElementMetadata.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[ 0 ]).toBe('function');

        const parserInstances = getMetadata<any[]>(XmlElementMetadata.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[ 0 ]).toBeInstanceOf(ElementAttributeParser);

      });

    });

  });

});
