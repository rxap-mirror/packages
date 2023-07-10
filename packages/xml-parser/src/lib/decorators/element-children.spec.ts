import { ParsedElement } from '../elements/parsed-element';
import { XmlElementMetadata } from './utilities';
import {
  ElementChildren,
  ElementChildrenParser,
} from './element-children';
import { ElementDef } from './element-def';
import { getMetadata } from '@rxap/reflect-metadata';
import { TestingXmlParserService } from '../testing/testing-xml-parser-service';

describe('@rxap/xml-parser', () => {

  describe('ElementChildren', () => {

    describe('@ElementChildren', () => {

      let xmlParser: TestingXmlParserService;

      beforeEach(() => {
        xmlParser = new TestingXmlParserService();
      });

      it('should add element parser to element metadata', () => {

        class MyChild implements ParsedElement {
          public validate(): boolean {
            return true;
          }
        }

        class MyElement {

          @ElementChildren(MyChild)
          public child!: MyChild[];

        }

        const parser: any[] = getMetadata<any[]>(XmlElementMetadata.PARSER, MyElement)!;

        expect(parser).toBeDefined();
        expect(parser.length).toBe(1);
        expect(typeof parser[0]).toBe('function');

        const parserInstances = getMetadata<any[]>(XmlElementMetadata.PARSER_INSTANCE, MyElement.prototype)!;

        expect(parserInstances).toBeDefined();
        expect(parserInstances.length).toBe(1);
        expect(parserInstances[0]).toBeInstanceOf(ElementChildrenParser);

      });

      it('should parse children', () => {


        @ElementDef('child')
        class ChildElement {
        }

        @ElementDef('host')
        class HostElement implements ParsedElement {

          @ElementChildren(ChildElement)
          public children!: ChildElement[];

          public validate(): boolean {
            return true;
          }

        }

        const xml = `<host><child/><child/><child/></host>`;

        const host = xmlParser.parseFromXmlTesting(xml, HostElement);

        expect(host.children).toBeDefined();
        expect(host.children.length).toBe(3);

      });

      /**
       * this is not possible currently, because the parser is not able to parse the children
       * if the element is not specified in the @ElementChildren decorator.
       * This is because the parser is not able to determine the element name of the child
       * elements. The @ElementChildren decorator creates a parser instance of ElementChildrenParser
       * without any defined this.elementType.
       *
       * TODO : add a way to automatically resolve the correct Element class that is needed to parse the child elements.
       */
      it.skip('should parse children without specified Element', () => {

        @ElementDef('child-a')
        class ChildAElement {
        }

        @ElementDef('child-b')
        class ChildBElement {
        }

        @ElementDef('child-c')
        class ChildCElement {
        }

        @ElementDef('host')
        class HostElement implements ParsedElement {

          @ElementChildren()
          public children!: Array<ChildAElement | ChildBElement | ChildCElement>;

          public validate(): boolean {
            return true;
          }

        }

        const xml = `<host><child-a/><child-b/><child-c/></host>`;

        xmlParser.register(ChildAElement);
        xmlParser.register(ChildBElement);
        xmlParser.register(ChildCElement);
        const host = xmlParser.parseFromXmlTesting(xml, HostElement);

        expect(host.children).toBeDefined();
        expect(host.children.length).toBe(3);
        expect(host.children[0]).toBeInstanceOf(ChildAElement);
        expect(host.children[1]).toBeInstanceOf(ChildBElement);
        expect(host.children[2]).toBeInstanceOf(ChildCElement);

      });

    });

  });

});
