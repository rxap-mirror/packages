import { getMetadata } from '@rxap/reflect-metadata';
import {
  ElementDef,
  ElementParserMetaData,
  ParsedElement,
  XmlParserService,
} from '@rxap/xml-parser';
import { DOMParser } from 'xmldom';
import {
  ElementChildTextContent,
  ElementChildTextContentParser,
} from './element-child-text-content';

describe('@rxap/xml-parser', () => {

  describe('ElementChildTextContent', () => {

    describe('ElementChildTextContentParser', () => {

      it('should use parseValue function', () => {


        const parser = new ElementChildTextContentParser('property',
          {
            tag: 'tag',
            parseValue: Boolean,
          },
        );

        expect(parser.parse({} as any,
          {
            hasChild: () => true,
            getChildTextContent: () => 'true',
          } as any,
          {} as any,
        ))
          .toHaveProperty('property', true);

      });

    });

    describe('@ElementChildTextContent', () => {

      it('should add element parser to element metadata if options object is used', () => {

        class MyElement {

          @ElementChildTextContent({ tag: 'my-child' })
          public name!: string;

        }

        const parser: any[] = getMetadata<any[]>(ElementParserMetaData.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementChildTextContentParser);

      });

      it('should add element parser to element metadata if tag string is used', () => {

        class MyElement {

          @ElementChildTextContent('my-child')
          public name!: string;

        }

        const parser: any[] = getMetadata<any[]>(ElementParserMetaData.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementChildTextContentParser);

      });

      it('should parse the child text content', () => {

        @ElementDef('my-element')
        class MyElement implements ParsedElement {

          __tag?: string;

          @ElementChildTextContent('my-child')
          public name!: string;

        }

        const xml = '<my-element><my-child>test</my-child></my-element>';
        const xmlParser = new XmlParserService(DOMParser);
        xmlParser.setRootElement(MyElement);

        const element = xmlParser.parseFromXml<MyElement>(xml);

        expect(element).toBeInstanceOf(MyElement);
        expect(element.name).toBe('test');

      });

    });

  });

});
