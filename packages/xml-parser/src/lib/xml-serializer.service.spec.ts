import {
  ElementAttribute,
  ElementChild,
  ElementChildRawContent,
  ElementChildren,
  ElementChildrenTextContent,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementTextContent,
  ParsedElement,
} from '@rxap/xml-parser';
import {
  DOMParser,
  XMLSerializer,
} from 'xmldom';
import { XmlSerializerService } from './xml-serializer.service';

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

          @ElementAttribute()
          name = 'root-name';

          @ElementChild(Child)
          child = new Child();

          validate(): boolean {
            return true;
          }

        }

        const instance = new Root();
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

      it('with child extends', () => {

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

    });

  });

});
