import { DataSourceElement } from './data-source.element';
import { TestingXmlParserService } from '../testing/testing-xml-parser-service';

describe('@rxap/xml-parser', () => {

  describe('elements', () => {

    describe('DataSourceElement', () => {

      let xmlParser: TestingXmlParserService;

      beforeEach(() => {
        xmlParser = new TestingXmlParserService();
      });

      it('data source element without children', () => {

        const template = '<data-source>id</data-source>';

        const parsedElement = xmlParser.parseFromXmlTesting(template, DataSourceElement);

        expect(parsedElement.id).toEqual('id');


      });

      it('data source element with children', () => {

        const template = `
<data-source>
  <id>id</id>
</data-source>`;

        const parsedElement = xmlParser.parseFromXmlTesting(template, DataSourceElement);

        expect(parsedElement.id).toEqual('id');


      });

    });

  });

});
