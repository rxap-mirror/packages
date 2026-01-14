import { NormalizeFormComponent } from './form-component';
import { NormalizeFormDefinition } from './form-definition';
import { NormalizeAccordionIdentifier } from '../accordion-identifier';
import { NormalizeMatFormFieldDefaultOptions } from '../mat-form-field-default-options';

jest.mock('./form-definition', () => ({
  NormalizeFormDefinition: jest.fn((f) => ({ ...f })),
}));

jest.mock('../accordion-identifier', () => ({
  NormalizeAccordionIdentifier: jest.fn((i) => i),
}));

jest.mock('../mat-form-field-default-options', () => ({
  NormalizeMatFormFieldDefaultOptions: jest.fn((o) => o),
}));

describe('NormalizeFormComponent', () => {
  it('should normalize form component', () => {
    const form = { window: true };
    const result = NormalizeFormComponent(form as any);

    expect(result.window).toBe(true);
    expect(NormalizeFormDefinition).toHaveBeenCalled();
    expect(NormalizeAccordionIdentifier).toHaveBeenCalled();
    expect(NormalizeMatFormFieldDefaultOptions).toHaveBeenCalled();
  });
});
