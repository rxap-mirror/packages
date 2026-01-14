import { AccordionHeaderKinds } from './accordion-header-kind';

describe('AccordionHeaderKinds', () => {
  it('should have the expected values', () => {
    expect(AccordionHeaderKinds.Default).toBe('default');
    expect(AccordionHeaderKinds.Static).toBe('static');
    expect(AccordionHeaderKinds.Property).toBe('property');
  });
});
