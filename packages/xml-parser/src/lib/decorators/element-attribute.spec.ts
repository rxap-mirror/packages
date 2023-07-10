import {
  ElementAttribute,
  ElementAttributeParser,
} from './element-attribute';
import { XmlElementMetadata } from './utilities';
import { compile } from 'handlebars';
import { getMetadata } from '@rxap/reflect-metadata';
import { XmlParserService } from '../xml-parser.service';
import { RxapElement } from '../element';

describe('@rxap/xml-parser', () => {

  describe('ElementAttribute', () => {

    describe('ElementAttributeParser', () => {

      const xmlParser: XmlParserService = {} as any;

      it(
        'should not set parsed element property if attribute is not present and if not required and no default value is defined',
        () => {

          const parser = new ElementAttributeParser('property', { attribute: 'attribute' });

          expect(parser.parse(xmlParser, { has: () => false } as any, {} as any)).not.toHaveProperty('property');

        },
      );

      it('should throw if element attribute is not present and if required', () => {

        const parser = new ElementAttributeParser(
          'property',
          {
            attribute: 'attribute',
            required: true,
          },
        );

        expect(() => parser.parse(xmlParser, { has: () => false } as any, {} as any)).toThrowError();

      });

      it('should set parsed element property with default value if attribute is not present', () => {

        const parser = new ElementAttributeParser('property', {
          attribute: 'attribute',
          defaultValue: 'my-default-value',
        });

        expect(parser.parse(xmlParser, { has: () => false } as any, {} as any))
          .toHaveProperty('property', 'my-default-value');

      });

      it(
        'should not throw if element attribute is not present and if required had have defined default property',
        () => {

          const parser = new ElementAttributeParser('property', {
            attribute: 'attribute',
            required: true,
            defaultValue: 'my-default-value',
          });

          expect(() => parser.parse(xmlParser, { has: () => false } as any, {} as any)).not.toThrowError();

          expect(parser.parse(xmlParser, { has: () => false } as any, {} as any))
            .toHaveProperty('property', 'my-default-value');

        },
      );

      it('should use default value parse if attribute is present and no value parse is defined', () => {

        const parser = new ElementAttributeParser('property', { attribute: 'attribute' });

        const element: RxapElement = {
          has: () => true,
          get: () => 'value',
        } as any;

        const elementGetSpy = jest.spyOn(element, 'get');

        elementGetSpy.mockReturnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'my-value');

        elementGetSpy.mockReturnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '');

        elementGetSpy.mockReturnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', false);

        elementGetSpy.mockReturnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.mockReturnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', -1);

        elementGetSpy.mockReturnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 1);

        elementGetSpy.mockReturnValue('"true"');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'true');

        elementGetSpy.mockReturnValue('\'true\'');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'true');

        elementGetSpy.mockReturnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', {});

        elementGetSpy.mockReturnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', []);

      });

      it('should use Number() as parser', () => {

        const parser = new ElementAttributeParser(
          'property',
          {
            attribute: 'attribute',
            parseValue: Number,
          },
        );

        const element: RxapElement = {
          has: () => true,
          get: () => 'value',
        } as any;

        const elementGetSpy = jest.spyOn(element, 'get');

        elementGetSpy.mockReturnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.mockReturnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.mockReturnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.mockReturnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.mockReturnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', NaN);

        elementGetSpy.mockReturnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.mockReturnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.mockReturnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 1);

        elementGetSpy.mockReturnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', -1);

      });

      it('should use String() as parser', () => {

        const parser = new ElementAttributeParser(
          'property',
          {
            attribute: 'attribute',
            parseValue: String,
          },
        );

        const element: RxapElement = {
          has: () => true,
          get: () => 'value',
        } as any;

        const elementGetSpy = jest.spyOn(element, 'get');

        elementGetSpy.mockReturnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'my-value');

        elementGetSpy.mockReturnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'true');

        elementGetSpy.mockReturnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 'false');

        elementGetSpy.mockReturnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '[]');

        elementGetSpy.mockReturnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '{}');

        elementGetSpy.mockReturnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '0');

        elementGetSpy.mockReturnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '1');

        elementGetSpy.mockReturnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '-1');

        elementGetSpy.mockReturnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', '');

      });

      it('should use Boolean() as parser', () => {

        const parser = new ElementAttributeParser(
          'property',
          {
            attribute: 'attribute',
            parseValue: Boolean,
          },
        );

        const element: RxapElement = {
          has: () => true,
          get: () => 'value',
        } as any;

        const elementGetSpy = jest.spyOn(element, 'get');

        elementGetSpy.mockReturnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', false);

      });

      it('should use Array() as parser', () => {

        const parser = new ElementAttributeParser(
          'property',
          {
            attribute: 'attribute',
            parseValue: Array,
          },
        );

        const element: RxapElement = {
          has: () => true,
          get: () => 'value',
        } as any;

        const elementGetSpy = jest.spyOn(element, 'get');

        elementGetSpy.mockReturnValue('my-value');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ 'my-value' ]);

        elementGetSpy.mockReturnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ 'true' ]);

        elementGetSpy.mockReturnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ 'false' ]);

        elementGetSpy.mockReturnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '[]' ]);

        elementGetSpy.mockReturnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '{}' ]);

        elementGetSpy.mockReturnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '0' ]);

        elementGetSpy.mockReturnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '1' ]);

        elementGetSpy.mockReturnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '-1' ]);

        elementGetSpy.mockReturnValue('');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', [ '' ]);

      });

      it('should use Array() as parser', () => {

        const parser = new ElementAttributeParser(
          'property',
          {
            attribute: 'attribute',
            parseValue: JSON.parse,
          },
        );

        const element: RxapElement = {
          has: () => true,
          get: () => 'value',
        } as any;

        const elementGetSpy = jest.spyOn(element, 'get');

        elementGetSpy.mockReturnValue('my-value');
        expect(() => parser.parse(xmlParser, element, {} as any)).toThrowError();

        elementGetSpy.mockReturnValue('true');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', true);

        elementGetSpy.mockReturnValue('false');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', false);

        elementGetSpy.mockReturnValue('[]');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', []);

        elementGetSpy.mockReturnValue('{}');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', {});

        elementGetSpy.mockReturnValue('0');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 0);

        elementGetSpy.mockReturnValue('1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', 1);

        elementGetSpy.mockReturnValue('-1');
        expect(parser.parse(xmlParser, element, {} as any)).toHaveProperty('property', -1);

        elementGetSpy.mockReturnValue('');
        expect(() => parser.parse(xmlParser, element, {} as any)).toThrowError();

      });

      it('should use Handlebars.compile as parser', () => {

        const parser = new ElementAttributeParser(
          'property',
          {
            attribute: 'attribute',
            parseValue: compile,
          },
        );

        const element: RxapElement = {
          has: () => true,
          get: () => 'value',
        } as any;

        const elementGetSpy = jest.spyOn(element, 'get');
        elementGetSpy.mockReturnValue('my-value');
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
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(XmlElementMetadata.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementAttributeParser);

      });

    });

  });

});
