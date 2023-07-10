import {
  ElementChild,
  ElementChildParser,
} from './element-child';
import {
  ParsedElementType,
  XmlElementMetadata,
} from './utilities';
import { getMetadata } from '@rxap/reflect-metadata';
import { RxapElement } from '../element';
import { ParsedElement } from '../elements/parsed-element';
import { XmlParserService } from '../xml-parser.service';
import { RxapXmlParserValidateRequiredError } from '../error';

describe('@rxap/xml-parser', () => {

  describe('ElementChild', () => {

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

        const parser: any[] = getMetadata<any[]>(XmlElementMetadata.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(XmlElementMetadata.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementChildParser);

      });

    });

  });

});
