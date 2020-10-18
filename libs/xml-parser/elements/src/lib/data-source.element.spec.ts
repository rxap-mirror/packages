import { DataSourceElement } from './data-source.element';
import { TestingXmlParserService } from '@rxap/xml-parser/testing';
import { TestBed } from '@angular/core/testing';

describe('@rxap/xml-parser', () => {

  describe('elements', () => {

    describe('DataSourceElement', () => {

      let xmlParser: TestingXmlParserService;

      beforeEach(() => {
        xmlParser = TestBed.get(TestingXmlParserService);
      });

      it('data source element without children', () => {

        const template = '<data-source>id</data-source>';

        const parsedElement = xmlParser.parseFromXmlTesting(template, DataSourceElement);

        expect(parsedElement.id).toEqual('id');
        expect(parsedElement.getViewer()).toEqual({});


      });

      it('data source element with children', () => {

        const template = `
<data-source>
  <id>id</id>
</data-source>`;

        const parsedElement = xmlParser.parseFromXmlTesting(template, DataSourceElement);

        expect(parsedElement.id).toEqual('id');
        expect(parsedElement.getViewer()).toEqual({});


      });

      it('data source element with viewer template', () => {

        const template = `
<data-source>
  <id>id</id>
  <viewer>
    <key>value</key>
    <bool>false</bool>
    <num>0</num>
    <obj>{ "name": "{{context.name}}" }</obj>
    <path-params>{ "name": "{{context.name}}" }</path-params>
  </viewer>
</data-source>`;

        const parsedElement = xmlParser.parseFromXmlTesting(template, DataSourceElement);

        expect(parsedElement.id).toEqual('id');
        expect(parsedElement.getViewer({ name: 'my-name' })).toEqual({
          key:        'value',
          bool:       false,
          num:        0,
          obj:        { name: 'my-name' },
          pathParams: { name: 'my-name' }
        });

      });

      it('data source element with children and viewer', () => {

        const template = `
<data-source>
  <id>id</id>
  <viewer>
    <key>value</key>
    <bool>false</bool>
    <num>0</num>
  </viewer>
</data-source>`;

        const parsedElement = xmlParser.parseFromXmlTesting(template, DataSourceElement);

        expect(parsedElement.id).toEqual('id');
        expect(parsedElement.getViewer()).toEqual({ key: 'value', bool: false, num: 0 });


      });

    });

  });

});
