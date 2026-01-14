import { buildPropertyList } from './build-property-list';
import { AccordionItemKinds } from '../../../lib/accordion/accordion-item-kind';
import { IsNormalizedPropertyAccordionHeader } from '../../../lib/accordion/header/property-accordion-header';
import { IsNormalizedPropertyPersistent } from '../../../lib/persistent';
import { NormalizeDataProperty } from '@rxap/ts-morph';

jest.mock('../../../lib/accordion/header/property-accordion-header', () => ({
  IsNormalizedPropertyAccordionHeader: jest.fn(() => false),
}));

jest.mock('../../../lib/persistent', () => ({
  IsNormalizedPropertyPersistent: jest.fn(() => false),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataProperty: jest.fn((p) => p),
}));

describe('buildPropertyList', () => {
  it('should build property list with identifier', () => {
    const options = {
      itemList: [],
      propertyList: [],
      identifier: { property: { name: 'id' } },
    };
    const result = buildPropertyList(options as any);
    expect(result).toContainEqual({ name: 'id' });
  });

  it('should add persistent property if it does not exist', () => {
    (IsNormalizedPropertyPersistent as any).mockReturnValue(true);
    const options = {
      itemList: [],
      propertyList: [],
      persistent: { property: { name: 'pers' } },
    };
    const result = buildPropertyList(options as any);
    expect(result).toContainEqual({ name: 'pers' });
  });

  it('should add header property if it does not exist', () => {
    (IsNormalizedPropertyAccordionHeader as any).mockReturnValue(true);
    const options = {
      itemList: [],
      propertyList: [],
      header: { property: { name: 'head' } },
    };
    const result = buildPropertyList(options as any);
    expect(result).toContainEqual({ name: 'head' });
  });

  it('should add switch properties', () => {
      const options = {
          itemList: [{ kind: AccordionItemKinds.Switch, switch: { property: { name: 'sw', type: 'string' } } }],
          propertyList: [],
      };
      const result = buildPropertyList(options as any);
      expect(result).toContainEqual({ name: 'sw', type: 'string' });
  });
});
