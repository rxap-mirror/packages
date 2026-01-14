import { NormalizeBaseAccordionItem } from './base-accordion-item';
import { AccordionItemKinds } from '../accordion-item-kind';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataPropertyList: jest.fn((l) => l),
  NormalizeTypeImportList: jest.fn((l) => l),
  NormalizeUpstreamOptions: jest.fn((o) => o),
}));

jest.mock('../../load-handlebars-template', () => ({
  LoadHandlebarsTemplate: jest.fn(() => 'mock-handlebars'),
}));

jest.mock('../../utilities/if-truthy', () => ({
  NormalizeIfTruthy: jest.fn(() => null),
}));

jest.mock('../../accordion-identifier', () => ({
  NormalizeAccordionIdentifier: jest.fn(() => null),
}));

describe('NormalizeBaseAccordionItem', () => {
  it('should normalize item with default values', () => {
    const item = { name: 'test-item', title: 'Test Item', kind: AccordionItemKinds.Default };
    const result = NormalizeBaseAccordionItem(item as any);

    expect(result.name).toBe('test-item');
    expect(result.kind).toBe(AccordionItemKinds.Default);
    expect(result.template).toBe('default-accordion-item.hbs');
    expect(result.handlebars).toBe('mock-handlebars');
  });

  it('should throw for unsupported kind', () => {
    const item = { name: 'test', kind: 'invalid' };
    expect(() => NormalizeBaseAccordionItem(item as any)).toThrow("The item type 'invalid' for item 'test' is not supported");
  });

  it('should generate title from name if missing', () => {
    const item = { name: 'my-item', kind: AccordionItemKinds.Default };
    const result = NormalizeBaseAccordionItem(item as any);
    expect(result.title).toBe('My Item');
  });
});
