import { XmlParserService } from '../xml-parser.service';
import { ParsedElement } from '../elements/parsed-element';
import {
  ElementDef,
} from './element-def';
import { DOMParser } from 'xmldom';
import { ElementChildrenAttribute } from './element-children-attribute';

describe('ElementChildrenAttribute', () => {

  // describe('ElementChildrenAttributeParser', () => {});

  describe('@ElementChildrenAttribute', () => {

    @ElementDef('test')
    class TestElement implements ParsedElement {

      @ElementChildrenAttribute('metadata', 'about')
      metadata?: string[];

      validate(): boolean {
        return true;
      }

    }

    let xmlParser: XmlParserService;

    beforeEach(() => {
      xmlParser = new XmlParserService(DOMParser);
      xmlParser.setRootElement(TestElement);
    });

    it('should parse xml with children attributes', () => {

      const xml = '<test><metadata about="a"/><metadata about="b"/></test>';

      const test = xmlParser.parseFromXml<TestElement>(xml);

      expect(test).toBeInstanceOf(TestElement);
      expect(test.metadata).toEqual([ 'a', 'b' ]);

    });

  });

});
