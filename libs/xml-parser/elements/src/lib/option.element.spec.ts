import {
  OptionElement,
  OptionsElement
} from './option.element';
import { TestingXmlParserService } from '@rxap/xml-parser/testing';
import { DataSourceElement } from './data-source.element';

describe('@rxap/form-system/xml-parser', () => {

  describe('Elements', () => {

    describe('OptionElement', () => {

      let xmlParser: TestingXmlParserService;

      beforeEach(() => {
        xmlParser = new TestingXmlParserService();
      });

      it('should parse option without defined value', () => {

        const optionElement = xmlParser.parseFromXmlTesting('<option>my-display</option>', OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toBeUndefined();
        expect(optionElement.getControlOption()).toEqual({ value: 'my-display', display: 'my-display' });

      });

      it('should parse option with string value', () => {

        let optionElement = xmlParser.parseFromXmlTesting('<option value="my-value" >my-display</option>', OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual('my-value');
        expect(optionElement.getControlOption()).toEqual({ value: 'my-value', display: 'my-display' });

        optionElement = xmlParser.parseFromXmlTesting(`<option value="'true'" >my-display</option>`, OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual('true');
        expect(optionElement.getControlOption()).toEqual({ value: 'true', display: 'my-display' });

        optionElement = xmlParser.parseFromXmlTesting(`<option value="'0'" >my-display</option>`, OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual('0');
        expect(optionElement.getControlOption()).toEqual({ value: '0', display: 'my-display' });

      });

      it('should parse option with boolean value', () => {

        let optionElement = xmlParser.parseFromXmlTesting(`<option value="true" >my-display</option>`, OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual(true);
        expect(optionElement.getControlOption()).toEqual({ value: true, display: 'my-display' });

        optionElement = xmlParser.parseFromXmlTesting(`<option value="false" >my-display</option>`, OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual(false);
        expect(optionElement.getControlOption()).toEqual({ value: false, display: 'my-display' });

      });

      it('should parse option with number value', () => {

        let optionElement = xmlParser.parseFromXmlTesting(`<option value="0" >my-display</option>`, OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual(0);
        expect(optionElement.getControlOption()).toEqual({ value: 0, display: 'my-display' });

        optionElement = xmlParser.parseFromXmlTesting(`<option value="1" >my-display</option>`, OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual(1);
        expect(optionElement.getControlOption()).toEqual({ value: 1, display: 'my-display' });

        optionElement = xmlParser.parseFromXmlTesting(`<option value="-1" >my-display</option>`, OptionElement);

        expect(optionElement.display).toEqual('my-display');
        expect(optionElement.value).toEqual(-1);
        expect(optionElement.getControlOption()).toEqual({ value: -1, display: 'my-display' });

      });

    });

    describe('OptionsElement', () => {

      let xmlParser: TestingXmlParserService;

      beforeEach(() => {
        xmlParser = TestBed.get(TestingXmlParserService);
      });

      it('should parse options element with static options', () => {

        const xml = `<options>
  <option>option1</option>
  <option>option2</option>
  <option>option3</option>
</options>`;

        const optionsElement = xmlParser.parseFromXmlTesting(xml, OptionsElement);

        expect(optionsElement.options).toBeDefined();
        expect(optionsElement.options!.length).toBe(3);
        expect(optionsElement.getControlOptions()).toEqual([
          { value: 'option1', display: 'option1' },
          { value: 'option2', display: 'option2' },
          { value: 'option3', display: 'option3' }
        ]);
        expect(optionsElement.toDisplay).toBeUndefined();
        expect(optionsElement.dataSource).toBeUndefined();

      });

      it('should parse options element with dataSource', () => {

        const xml = `<options>
<data-source>my-data-source-id</data-source>
</options>`;

        const optionsElement = xmlParser.parseFromXmlTesting(xml, OptionsElement);

        expect(optionsElement.dataSource).toBeDefined();
        expect(optionsElement.dataSource).toBeInstanceOf(DataSourceElement);
        expect(optionsElement.dataSource!.id).toBe('my-data-source-id');
        expect(optionsElement.options).toEqual([]);
        expect(optionsElement.toDisplay).toBeUndefined();

      });

      it('should parse options element with toDisplay', () => {

        expect(() => xmlParser.parseFromXmlTesting(`<options><to-display>my-data-source-id</to-display></options>`, OptionsElement)).toThrowError();

        const withDataSource = `<options>
<data-source>my-data-source-id</data-source>
<to-display>{{uuid}}</to-display>
</options>`;

        const optionsElement = xmlParser.parseFromXmlTesting(withDataSource, OptionsElement);

        expect(optionsElement.toDisplay).toBeDefined();
        expect(optionsElement.toDisplay?.template).toBeDefined();
        expect(typeof optionsElement.toDisplay?.template).toBe('function');
        expect(optionsElement.toDisplay?.toValue()({ uuid: 'my-uuid' })).toBe('my-uuid');
        expect(optionsElement.dataSource).toBeDefined();
        expect(optionsElement.dataSource).toBeInstanceOf(DataSourceElement);
        expect(optionsElement.dataSource!.id).toBe('my-data-source-id');

      });

    });

  });

});
