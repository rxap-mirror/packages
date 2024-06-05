import { Normalized } from '@rxap/utilities';
import {
  AccordionIdentifier,
  NormalizeAccordionIdentifier,
  NormalizedAccordionIdentifier,
} from '../accordion-identifier';
import { NormalizeMatFormFieldDefaultOptions, MatFormFieldDefaultOptions,
  NormalizedMatFormFieldDefaultOptions, } from '../mat-form-field-default-options';
import {
  FormDefinition,
  NormalizedFormDefinition,
  NormalizeFormDefinition,
} from './form-definition';

export interface FormComponent extends FormDefinition {
  window?: boolean;
  role?: string;
  matFormFieldDefaultOptions?: MatFormFieldDefaultOptions;
  identifier?: AccordionIdentifier;
}

export interface NormalizedFormComponent extends Readonly<Normalized<Omit<FormComponent, keyof FormDefinition | 'matFormFieldDefaultOptions'>> & NormalizedFormDefinition> {
  identifier: NormalizedAccordionIdentifier | null;
  matFormFieldDefaultOptions: NormalizedMatFormFieldDefaultOptions | null;
}

export function NormalizeFormComponent(
  formComponent: Readonly<FormComponent>,
): NormalizedFormComponent {
  return {
    ...NormalizeFormDefinition(formComponent),
    identifier: NormalizeAccordionIdentifier(formComponent.identifier),
    matFormFieldDefaultOptions: NormalizeMatFormFieldDefaultOptions(formComponent.matFormFieldDefaultOptions),
    window: formComponent.window ?? false,
    role: formComponent.role ?? null,
  };
}
