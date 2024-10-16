import {
  ElementAttribute,
  ElementChild,
  ElementDef,
  ParsedElement,
} from '@rxap/xml-parser';
import { DOMParser, XMLSerializer } from 'xmldom';
import { XmlSerializerService } from './xml-serializer.service';

describe('XML Serializer', () => {

  describe('Xml Serializer Service', () => {

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

  });

});
