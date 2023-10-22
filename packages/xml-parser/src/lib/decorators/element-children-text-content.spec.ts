import { getMetadata } from '@rxap/reflect-metadata';
import {
  ElementChildrenTextContent,
  ElementChildrenTextContentParser,
  ElementDef,
  ElementParserMetaData,
  ParsedElement,
  XmlParserService,
} from '@rxap/xml-parser';
import { DOMParser } from 'xmldom';

describe('@rxap/xml-parser', () => {

  describe('ElementChildrenTextContent', () => {

    describe('ElementChildrenTextContentParser', () => {

      it('should use parseValue function', () => {


        const parser = new ElementChildrenTextContentParser(
          'property',
          {
            tag: 'tag',
            parseValue: Boolean,
          },
        );

        expect(parser.parse(
          {} as any,
          {
            getAllChildNodes: () => [
              {
                hasName: () => true,
                getTextContent: () => 'true',
              },
            ],
          } as any,
          {} as any,
        ))
          .toHaveProperty('property', [ true ]);

      });

    });

    describe('@ElementChildrenTextContent', () => {

      it('should add element parser to element metadata if options object is used', () => {

        class MyElement {

          @ElementChildrenTextContent({ tag: 'my-child' })
          public name!: string;

        }

        const parser: any[] = getMetadata<any[]>(ElementParserMetaData.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementChildrenTextContentParser);

      });

      it('should add element parser to element metadata if tag string is used', () => {

        class MyElement {

          @ElementChildrenTextContent('my-child')
          public name!: string;

        }

        const parser: any[] = getMetadata<any[]>(ElementParserMetaData.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementChildrenTextContentParser);

      });

      it('should parse the children text content', () => {

        @ElementDef('my-element')
        class MyElement implements ParsedElement {

          __tag?: string;

          @ElementChildrenTextContent('my-child')
          public nameList!: string[];

        }

        const xml = '<my-element><my-child>test</my-child></my-element>';
        const xmlParser = new XmlParserService(DOMParser);
        xmlParser.setRootElement(MyElement);

        const element = xmlParser.parseFromXml<MyElement>(xml);

        expect(element).toBeInstanceOf(MyElement);
        expect(element.nameList).toHaveLength(1);
        expect(element.nameList[0]).toBe('test');

      });

      it('should parse the children text content in group', () => {

        @ElementDef('my-element')
        class MyElement implements ParsedElement {

          __tag?: string;

          @ElementChildrenTextContent({
            tag: 'my-child',
            group: 'my-group',
          })
          public nameList!: string[];

        }

        const xml = '<my-element><my-group><my-child>test</my-child></my-group></my-element>';
        const xmlParser = new XmlParserService(DOMParser);
        xmlParser.setRootElement(MyElement);

        const element = xmlParser.parseFromXml<MyElement>(xml);

        expect(element).toBeInstanceOf(MyElement);
        expect(element.nameList).toHaveLength(1);
        expect(element.nameList[0]).toBe('test');

      });

    });

  });

});
