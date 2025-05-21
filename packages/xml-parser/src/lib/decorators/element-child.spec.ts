import { getMetadata } from '@rxap/reflect-metadata';
import { ElementParserMetaData } from '@rxap/xml-parser';
import { DOMParser } from 'xmldom';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { RxapXmlParserValidateRequiredError } from '../error';
import { XmlParserService } from '../xml-parser.service';
import {
  ElementChild,
  ElementChildParser,
} from './element-child';
import { ElementDef } from './element-def';
import { ParsedElementType } from './utilities';

describe('@rxap/xml-parser', () => {

  describe('ElementChild', () => {

    it('should support circular child elements', () => {

      @ElementDef('child-a')
      class ChildA implements ParsedElement {

        b?: ChildB;

        validate(): boolean {
          return true;
        }

      }

      @ElementDef('child-b')
      class ChildB {

        @ElementChild(() => ChildA)
        a?: ChildA;

      }

      ElementChild(() => ChildB)(ChildA.prototype, 'b');

      const xml = '<child-a><child-b><child-a/></child-b></child-a>';
      const xmlParser = new XmlParserService(DOMParser);

      xmlParser.setRootElement(ChildA);
      const element = xmlParser.parseFromXml(xml);

      expect(element.toJSON()).toEqual({
        "__tag": "child-a",
        "__xmlns": {},
        "b": {
          "__parent": "child-a",
          "__tag": "child-b",
          "__xmlns": {},
          "a": {
            "__parent": "child-b",
            "__tag": "child-a",
            "__xmlns": {}
          }
        }
      });

    });

    describe('ElementChildParser', () => {

      it('should throw if the child element is not defined but required', () => {

        const parser = new ElementChildParser(
          'property',
          {} as any,
          {
            tag: 'tag',
            required: true,
          },
        );

        const hasChild = jest.fn().mockReturnValue(false);

        expect(() => parser.parse({} as any, { hasChild } as any, {} as any))
          .toThrowError(RxapXmlParserValidateRequiredError);
        expect(hasChild).toBeCalledTimes(1);
        expect(hasChild).toBeCalledWith('tag');

      });

      it(
        'should call xml parser with the xml child element and the child element type and set child element type',
        () => {

          const xmlChildElement: RxapElement = { data: 'xml' } as any;
          const getChild = jest.fn().mockReturnValue(xmlChildElement);
          const hasChild = jest.fn().mockReturnValue(true);
          const childElementType: ParsedElementType = class {
          };
          const childElement: ParsedElement = { data: 'my-child' } as any;
          const parsedElement: ParsedElement = { data: 'self' } as any;
          const parse = jest.fn().mockReturnValue(childElement);
          const xmlParser: XmlParserService = { parse } as any;
          const element: RxapElement = {
            getChild,
            hasChild,
          } as any;

          const parser = new ElementChildParser('property', childElementType, { tag: 'tag' });

          expect(parser.parse(xmlParser, element, parsedElement)).toHaveProperty('property', childElement);
          expect(getChild).toBeCalledTimes(1);
          expect(getChild).toBeCalledWith('tag');
          expect(hasChild).toBeCalledTimes(1);
          expect(hasChild).toBeCalledWith('tag');
          expect(parse).toBeCalledTimes(1);
          expect(parse).toBeCalledWith(xmlChildElement, childElementType, parsedElement);

        },
      );

      it('should not set property if child element is not present', () => {

        const parser = new ElementChildParser('property', {} as any, { tag: 'tag' });

        const hasChild = jest.fn().mockReturnValue(false);

        expect(parser.parse({} as any, { hasChild } as any, {} as any)).not.toHaveProperty('property');
        expect(hasChild).toBeCalledTimes(1);
        expect(hasChild).toBeCalledWith('tag');

      });

      it('should respect the path property and load the child element from the path', () => {

        const parser = new ElementChildParser('property', {} as any, {
          tag: 'tag',
          path: [ 'sub', 'path' ],
        });

        const mockElement: any = {};

        const hasChild = jest.fn().mockReturnValue(true);
        const getChild = jest.fn().mockReturnValue(mockElement);
        const parse = jest.fn();

        mockElement.getChild = getChild;
        mockElement.hasChild = hasChild;

        expect(parser.parse({ parse } as any, mockElement, {} as any)).toHaveProperty('property');
        expect(hasChild).toBeCalledTimes(3);
        expect(hasChild).toHaveBeenNthCalledWith(1, 'sub');
        expect(hasChild).toHaveBeenNthCalledWith(2, 'path');
        expect(hasChild).toHaveBeenNthCalledWith(3, 'tag');
        expect(getChild).toBeCalledTimes(3);
        expect(getChild).toHaveBeenNthCalledWith(1, 'sub');
        expect(getChild).toHaveBeenNthCalledWith(2, 'path');
        expect(getChild).toHaveBeenNthCalledWith(3, 'tag');

      });

    });

    describe('@ElementChild', () => {

      it('should add element parser to element metadata', () => {

        class MyChild implements ParsedElement {
          public validate(): boolean {
            return true;
          }
        }

        class MyElement {

          @ElementChild(MyChild)
          public child!: MyChild;

        }

        const parser: any[] = getMetadata<any[]>(ElementParserMetaData.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(ElementParserMetaData.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementChildParser);

      });

      it('should parse the child element with the given path and tag', () => {

        @ElementDef('my-child')
        class MyChild implements ParsedElement {
          public validate(): boolean {
            return true;
          }
        }

        @ElementDef('my-element')
        class MyElement {

          @ElementChild(MyChild, { path: [ 'sub', 'path' ] })
          public child!: MyChild;

          public validate(): boolean {
            return true;
          }

        }

        const parser = new XmlParserService(DOMParser);
        parser.register(MyElement, MyChild);
        parser.setRootElement(MyElement);

        const result = parser.parseFromXml<MyElement>('<my-element><sub><path><my-child/></path></sub></my-element>');

        expect(result).toBeDefined();
        expect(result).toBeInstanceOf(MyElement);
        expect(result.child).toBeDefined();
        expect(result.child).toBeInstanceOf(MyChild);


      });

      it('should overwrite the defined element child parser from the parent class', () => {

        @ElementDef('item')
        class Item implements ParsedElement {
          __tag?: string;
        }

        @ElementDef('other-item')
        class OtherItem extends Item {}

        @ElementDef('parent')
        class Parent implements ParsedElement {

          __tag?: string;

          @ElementChild(Item)
          item!: Item;

        }

        @ElementDef('child')
        class Child extends Parent {

          @ElementChild(OtherItem)
          declare item: OtherItem;

        }

        const parser = new XmlParserService(DOMParser);
        parser.setRootElement(Child);

        const xml = `<child><other-item></other-item></child>`;

        const element = parser.parseFromXml<Child>(xml);

        expect(element).toBeInstanceOf(Child);
        expect(element.item).toBeInstanceOf(OtherItem);

      });

    });

  });

});
