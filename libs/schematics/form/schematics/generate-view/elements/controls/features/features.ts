import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { ControlFeatureElement } from './control-feature.element';
import { ClearElement } from './clear.element';
import { HideElement } from './hide.element';
import { DirectiveElement } from './directive.element';
import { FormElement } from './form.element';
import { TableElement } from './table.element';
import { PermissionsElement } from './permissions.element';

export const Features: Array<Constructor<ParsedElement>> = [
  ControlFeatureElement,
  ClearElement,
  HideElement,
  DirectiveElement,
  TableElement,
  FormElement,
  PermissionsElement
];
