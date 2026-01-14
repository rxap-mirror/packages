import { NormalizeStaticAccordionHeader } from './static-accordion-header';
import { AccordionHeaderKinds } from '../accordion-header-kind';

jest.mock('../../load-handlebars-template', () => ({
  LoadHandlebarsTemplate: jest.fn(() => 'mock-handlebars'),
}));

describe('NormalizeStaticAccordionHeader', () => {
  it('should normalize static header with title', () => {
    const header = { title: 'Test Title' };
    const result = NormalizeStaticAccordionHeader(header);

    expect(result.kind).toBe(AccordionHeaderKinds.Static);
    expect(result.title).toBe('Test Title');
  });

  it('should throw if title is missing', () => {
    expect(() => NormalizeStaticAccordionHeader({} as any)).toThrow('The title property is required for a static accordion header');
  });
});
