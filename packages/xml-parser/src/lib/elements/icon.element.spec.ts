import {IconElement} from './icon.element';
import {TestingXmlParserService} from '../testing/testing-xml-parser-service';

describe('@rxap/xml-parser/elements', () => {

  describe('IconElement', () => {

    let xmlParser: TestingXmlParserService;

    beforeAll(() => {
      xmlParser = new TestingXmlParserService();
    });

    it('required properties', () => {

      const xml = `<icon><name>icon_name</name></icon>`;

      const iconElement = xmlParser.parseFromXmlTesting(xml, IconElement);

      expect(iconElement).toBeDefined();
      expect(iconElement.name).toBe('icon_name');
      expect(iconElement.getIconConfig()).toEqual({
        icon: 'icon_name',
      });

    });

    it('material icon', () => {

      const xml = `<icon>
<name>icon_name</name>
<color>warn</color>
<size>10px</size>
<tooltip>tooltip</tooltip>
<font-color>green</font-color>
</icon>`;

      const iconElement = xmlParser.parseFromXmlTesting(xml, IconElement);

      expect(iconElement).toBeDefined();
      expect(iconElement.name).toBe('icon_name');
      expect(iconElement.color).toBe('warn');
      expect(iconElement.size).toBe('10px');
      expect(iconElement.tooltip).toBe('tooltip');
      expect(iconElement.fontColor).toBe('green');
      expect(iconElement.svg).toBeUndefined();
      expect(iconElement.fontSet).toBeUndefined();
      expect(iconElement.fontIcon).toBeUndefined();
      expect(iconElement.getIconConfig()).toEqual({
        icon: 'icon_name',
        color: 'warn',
        size: '10px',
        tooltip: 'tooltip',
        fontColor: 'green',
      });

    });

    it('svg icon', () => {

      const xml = `<icon svg="true">
<name>icon_name</name>
<color>warn</color>
<size>10px</size>
<tooltip>tooltip</tooltip>
<font-color>green</font-color>
<font-set>font_set</font-set>
<font-icon>font_icon</font-icon>
</icon>`;

      const iconElement = xmlParser.parseFromXmlTesting(xml, IconElement);

      expect(iconElement).toBeDefined();
      expect(iconElement.name).toBe('icon_name');
      expect(iconElement.color).toBe('warn');
      expect(iconElement.size).toBe('10px');
      expect(iconElement.tooltip).toBe('tooltip');
      expect(iconElement.fontColor).toBe('green');
      expect(iconElement.svg).toBe(true);
      expect(iconElement.fontSet).toBe('font_set');
      expect(iconElement.fontIcon).toBe('font_icon');
      expect(iconElement.getIconConfig()).toEqual({
        svgIcon: 'icon_name',
        color: 'warn',
        size: '10px',
        tooltip: 'tooltip',
        fontColor: 'green',
        fontSet: 'font_set',
        fontIcon: 'font_icon',
      });

    });

  });


});
