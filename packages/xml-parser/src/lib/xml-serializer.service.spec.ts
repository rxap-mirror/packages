import {
  ElementAttribute,
  ElementChild,
  ElementChildRawContent,
  ElementChildren,
  ElementChildrenTextContent,
  ElementChildTextContent,
  ElementDef,
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

    });

  });

});
