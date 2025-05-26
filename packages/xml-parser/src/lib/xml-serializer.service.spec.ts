import { getMetadata } from '@rxap/reflect-metadata';
import {
  ElementAttribute,
  ElementChild,
  ElementChildRawContent,
  ElementChildren,
  ElementChildrenTextContent,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementParserMetaData,
  ElementTextContent,
  ParsedElement,
  XmlElementSerializerFunction,
} from '@rxap/xml-parser';
import {
  DOMParser,
  XMLSerializer,
} from 'xmldom';
import { createElement } from './create-element';
import { XmlSerializerService } from './xml-serializer.service';
import {
  ElementNamespace,
  getElementNamespaceMetadata,
} from './decorators/element-namespace';

describe('XML Serializer', () => {

  describe.each([
    {
      name: 'native',
      DOMParser: window.DOMParser,
      XMLSerializer: window.XMLSerializer,
    }, {
      name: 'xmldom',
      DOMParser,
      XMLSerializer,
    },
  ])('Xml Serializer Service', ({
    name,
    XMLSerializer,
    DOMParser,
  }) => {

    describe(name, () => {

      it('should not serialize undefined or null children', () => {

        @ElementDef('child')
        class Child implements ParsedElement {

          @ElementAttribute()
          name = 'child-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementDef('root')
        class Root implements ParsedElement {

          __tag?: string;

          @ElementAttribute()
          name = 'root-name';

          @ElementChild(Child)
          childA: Child | null = null;

          @ElementChild(Child)
          childB?: Child;

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        instance.__tag = 'root';
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('should only use the latest child serializer', () => {

        @ElementDef('child')
        class ChildA {}

        @ElementDef('child')
        class ChildB {}

        @ElementDef('child')
        class ChildC {}

        @ElementDef('base')
        class Base implements ParsedElement {

          __tag?: string;

          @ElementChild(ChildA)
          item!: ChildA;

        }

        @ElementDef('sub-a')
        class SubA extends Base {

          @ElementChild(ChildB)
          declare item: ChildB;

        }

        @ElementDef('sub-b')
        class SubB extends SubA {

          @ElementChild(ChildC)
          declare item: ChildC;

        }

        const serializersBase = getMetadata<XmlElementSerializerFunction<any>[]>(
          ElementParserMetaData.SERIALIZER,
          Base,
        ) ?? [];

        const serializersSubA = getMetadata<XmlElementSerializerFunction<any>[]>(
          ElementParserMetaData.SERIALIZER,
          SubA,
        ) ?? [];

        const serializersSubB = getMetadata<XmlElementSerializerFunction<any>[]>(
          ElementParserMetaData.SERIALIZER,
          SubB,
        ) ?? [];

        expect(serializersBase).toHaveLength(1);
        expect(serializersSubA).toHaveLength(1);
        expect(serializersSubB).toHaveLength(1);

        const subB = createElement(SubB, { item: createElement(ChildC) });
        expect(subB.item).toBeInstanceOf(ChildC);

        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(subB);

        expect(xml).toEqual('<sub-b><child/></sub-b>');

      });

      it('should serialize xmlns', () => {

        @ElementDef('definition')
        class UserElement implements ParsedElement {

          __xmlns?: Map<string, string>;

          public validate(): boolean {
            return true;
          }

        }

        const instance = new UserElement();
        instance.__xmlns = new Map<string, string>([
          [ '', 'http://www.w3.org/2001/XMLSchema-instance' ],
          [ 'xsi', 'http://www.w3.org/2001/XMLSchema-instance' ],
        ]);

        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('minimal example', () => {

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with child', () => {

        @ElementDef('child')
        class Child implements ParsedElement {

          @ElementAttribute()
          name = 'child-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementDef('root')
        class Root implements ParsedElement {

          __tag?: string;

          @ElementAttribute()
          name = 'root-name';

          @ElementChild(Child)
          child = new Child();

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        instance.__tag = 'root';
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with raw child', () => {

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          @ElementChildRawContent()
          child = 'some raw content';

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with text content child', () => {

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          @ElementChildTextContent()
          child = 'some text content';

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with children', () => {

        @ElementDef('child')
        class Child implements ParsedElement {

          @ElementAttribute()
          name = 'child-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          @ElementChildren(Child)
          children = [new Child(), new Child(), new Child()];

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with multiple children', () => {

        @ElementDef('child-a')
        class ChildA implements ParsedElement {

          @ElementAttribute()
          name = 'child-a-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementDef('child-b')
        class ChildB implements ParsedElement {

          @ElementAttribute()
          name = 'child-b-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          @ElementChildren(ChildA)
          childrenA = [new ChildA(), new ChildA(), new ChildA()];

          @ElementChildren(ChildB)
          childrenB = [new ChildB(), new ChildB(), new ChildB()];

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with children text content', () => {

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          @ElementChildrenTextContent()
          children = ['child-1', 'child-2', 'child-3'];

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with text content', () => {

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          @ElementTextContent()
          children = 'text content';

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with simple at root extends', () => {

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementDef('child')
        class Child implements ParsedElement {

          @ElementAttribute()
          name = 'child-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementExtends(Root)
        @ElementDef('sub')
        class Sub extends Root implements ParsedElement {

          @ElementAttribute()
          sub = 'sub';

          @ElementChildrenTextContent()
          children = ['child-1', 'child-2', 'child-3'];

        }

        const instance = new Sub();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('with children extends', () => {

        @ElementDef('base-child')
        class BaseChild implements ParsedElement {

          @ElementAttribute()
          name = 'child-name';

          validate(): boolean {
            return true;
          }

        }

        @ElementExtends(BaseChild)
        @ElementDef('child-a')
        class ChildA extends BaseChild implements ParsedElement {}

        @ElementExtends(BaseChild)
        @ElementDef('child-b')
        class ChildB extends BaseChild implements ParsedElement {}

        @ElementExtends(BaseChild)
        @ElementDef('child-c')
        class ChildC extends BaseChild implements ParsedElement {}

        @ElementDef('root')
        class Root implements ParsedElement {

          @ElementAttribute()
          name = 'root-name';

          validate(): boolean {
            return true;
          }

          @ElementChildren(BaseChild)
          children = [new BaseChild(), new ChildA(), new ChildB(), new ChildB(), new ChildC()];

        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toMatchSnapshot();

      });

      it('should add namespaces from decorator', () => {

        @ElementNamespace('rdf:https://domain.de')
        @ElementDef('rdf:RDF')
        class Root implements ParsedElement {

          __tag?: string;
        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        expect(getElementNamespaceMetadata(instance.constructor as any)).toEqual({
          rdf: 'https://domain.de',
        });

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toEqual('<rdf:RDF xmlns:rdf="https://domain.de"/>');

      });

      it('should add root namespaces from decorator', () => {

        @ElementNamespace({ '': 'https://domain.de' })
        @ElementDef('rdf:RDF')
        class Root implements ParsedElement {

          __tag?: string;
        }

        const instance = new Root();
        const xmlSerializer = new XmlSerializerService(DOMParser, XMLSerializer);

        expect(getElementNamespaceMetadata(instance.constructor as any)).toEqual({
          '': 'https://domain.de',
        });

        const xml = xmlSerializer.serializeToXml(instance);

        expect(xml).toEqual('<rdf:RDF xmlns="https://domain.de"/>');

      });

    });

  });

});
