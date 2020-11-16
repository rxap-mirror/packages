import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { FooterControlsElement } from './footer-controls.element';
import { WindowFooterControlsElement } from './window-footer-controls.element';
import { FormFeatureElement } from './form-feature.element';
import { FormFieldDefaultOptionsElement } from './form-field-default-options.element';
import { WindowTitleElement } from './window-title.element';

export const Features: Array<Constructor<ParsedElement>> = [
  FooterControlsElement,
  WindowFooterControlsElement,
  FormFeatureElement,
  FormFieldDefaultOptionsElement,
  WindowTitleElement
];
