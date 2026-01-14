import { NormalizeBaseAccordionHeader } from './base-accordion-header';
import { AccordionHeaderKinds } from '../accordion-header-kind';
import { LoadHandlebarsTemplate } from '../../load-handlebars-template';
import * as tsMorph from '@rxap/ts-morph';

jest.mock('../../load-handlebars-template', () => ({
  LoadHandlebarsTemplate: jest.fn(() => 'mock-handlebars'),
}));

jest.mock('@rxap/ts-morph', () => ({
  NormalizeDataPropertyList: jest.fn((list) => list),
  NormalizeTypeImportList: jest.fn((list) => list),
}));

describe('NormalizeBaseAccordionHeader', () => {
  it('should normalize with default values', () => {
    const header = {};
    const result = NormalizeBaseAccordionHeader(header);

    expect(result.kind).toBe(AccordionHeaderKinds.Default);
    expect(result.template).toBe('default-accordion-header.hbs');
    expect(result.handlebars).toBe('mock-handlebars');
    expect(result.importList).toContainEqual(expect.objectContaining({ name: 'NavigateBackButtonComponent' }));
  });

  it('should allow overriding kind and template', () => {
    const header = { kind: AccordionHeaderKinds.Static, template: 'custom.hbs' };
    const result = NormalizeBaseAccordionHeader(header);

    expect(result.kind).toBe(AccordionHeaderKinds.Static);
    expect(result.template).toBe('custom.hbs');
  });

  it('should merge propertyList', () => {
    const header = { propertyList: [{ name: 'prop1' } as any] };
    const result = NormalizeBaseAccordionHeader(header, [{ name: 'prop2' } as any]);

    expect(result.propertyList).toContainEqual({ name: 'prop1' });
    expect(result.propertyList).toContainEqual({ name: 'prop2' });
  });
});
