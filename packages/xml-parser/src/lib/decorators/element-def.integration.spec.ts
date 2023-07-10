import {ElementDef} from './element-def';
import {Constructor} from '@rxap/utilities';
import {ElementAttribute} from './element-attribute';
import {ElementChild} from './element-child';
import {ElementTextContent} from './element-text-content';
import {ElementChildTextContent} from './element-child-text-content';
import {ElementChildren} from './element-children';
import {getMetadata} from '@rxap/reflect-metadata';
import {XmlParserService} from '../xml-parser.service';
import {ParsedElement} from '../elements/parsed-element';
import {ElementParserMetaData} from './metadata-keys';
import {RxapElement} from '../element';

export class TestingXmlParserService extends XmlParserService {

  public parseFromXmlTesting<D extends ParsedElement>(xml: string, elementParser: Constructor<D>): D {

    this.register(elementParser);

    const elementName = getMetadata<string>(ElementParserMetaData.ELEMENT_NAME, elementParser);

    let xmlDoc: Document;
    try {
      xmlDoc = new DOMParser().parseFromString(xml, 'text/xml');
    } catch (e: any) {
      throw new Error('Could not parse xml string');
    }

    if (!xmlDoc.childNodes.length) {
      throw new Error('The parsed xml has not any element');
    }

    const root = new RxapElement(xmlDoc.childNodes.item(0) as Element);

    if (root.name !== elementName) {
      throw new Error(`The root node must be an <${elementName}> element but found <${root.name}>`);
    }

    return this.parse<D>(root, root.name, [] as any);

  }

}

describe('@rxap/xml-parser', () => {

  describe('@ElementDef', () => {

    let xmlParser: TestingXmlParserService;

    beforeEach(() => {
      xmlParser = new TestingXmlParserService();
    });

    it('should parse xml element with attributes', () => {

      @ElementDef('my-element')
      class MyElement implements ParsedElement {

        @ElementAttribute({attribute: 'name'})
        public name!: string;

        @ElementAttribute({attribute: 'age', parseValue: Number})
        public age!: number;

        public validate(): boolean {
          return true;
        }

      }

      const xml = `<my-element name="my-name" age="4"/>`;

      const myElement = xmlParser.parseFromXmlTesting(xml, MyElement);

      expect(myElement.name).toEqual('my-name');
      expect(myElement.age).toEqual(4);

    });

    it('should parse xml element with child', () => {

      @ElementDef('my-child')
      class ChildElement implements ParsedElement {

        @ElementAttribute({attribute: 'name'})
        public name!: string;

        public validate(): boolean {
          return true;
        }

      }

      @ElementDef('my-element')
      class MyElement implements ParsedElement {

        @ElementChild(ChildElement)
        public child!: ChildElement;

        public validate(): boolean {
          return true;
        }

      }

      const xml = `<my-element><my-child name="my-value"></my-child></my-element>`;

      const myElement = xmlParser.parseFromXmlTesting(xml, MyElement);

      expect(myElement.child).toBeDefined();
      expect(myElement.child).toBeInstanceOf(ChildElement);
      expect(myElement.child.name).toEqual('my-value');

    });

    it('should parse xml element with text content', () => {

      @ElementDef('my-element')
      class MyElement implements ParsedElement {

        @ElementTextContent()
        public text!: string;

        public validate(): boolean {
          return true;
        }

      }

      const xml = `<my-element>my-text-content</my-element>`;

      const myElement = xmlParser.parseFromXmlTesting(xml, MyElement);

      expect(myElement.text).toEqual('my-text-content');

    });

    it('should parse xml element with child text content', () => {

      @ElementDef('my-element')
      class MyElement implements ParsedElement {

        @ElementChildTextContent({tag: 'my-child'})
        public text!: string;

        @ElementChildTextContent({tag: 'my-name'})
        public name!: string;

        public validate(): boolean {
          return true;
        }

      }

      const xml = `<my-element>
<my-child>my-child-text-content</my-child>
<my-name>my-name-child-text-content</my-name>
</my-element>`;

      const myElement = xmlParser.parseFromXmlTesting(xml, MyElement);

      expect(myElement.text).toEqual('my-child-text-content');
      expect(myElement.name).toEqual('my-name-child-text-content');

    });

    it('should parse xml element with children', () => {

      @ElementDef('my-child')
      class ChildElement implements ParsedElement {

        @ElementAttribute({attribute: 'name'})
        public name!: string;

        public validate(): boolean {
          return true;
        }

      }

      @ElementDef('my-element')
      class MyElement implements ParsedElement {

        @ElementChildren(ChildElement)
        public children!: ChildElement[];

        public validate(): boolean {
          return true;
        }

      }

      const xml = `<my-element>
<my-child name="my-value1"></my-child>
<my-child name="my-value2"></my-child>
<my-child name="my-value3"></my-child>
</my-element>`;

      const myElement = xmlParser.parseFromXmlTesting(xml, MyElement);

      expect(myElement.children).toBeDefined();
      expect(myElement.children).toBeInstanceOf(Array);
      expect(myElement.children.length).toBe(3);
      const child1 = myElement.children[0];
      const child2 = myElement.children[1];
      const child3 = myElement.children[2];
      expect(child1).toBeInstanceOf(ChildElement);
      expect(child2).toBeInstanceOf(ChildElement);
      expect(child2).toBeInstanceOf(ChildElement);
      expect(child1.name).toEqual('my-value1');
      expect(child2.name).toEqual('my-value2');
      expect(child3.name).toEqual('my-value3');

    });

  });

});
