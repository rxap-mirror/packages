import {
  ElementAttribute,
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

  });

});
