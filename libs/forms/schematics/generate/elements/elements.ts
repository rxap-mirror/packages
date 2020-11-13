import { CheckboxControlElement } from './checkbox-control.element';
import { ControlElement } from './control.element';
import { FormElement } from './form.element';
import { GroupControlElement } from './group-control.element';
import { InputControlElement } from './input-control.element';
import {
  SelectControlElement,
  DataSourceElement,
  OpenApiDataSourceElement,
  DataSourceTransformerElement,
  ToOptionsWithObjectElement,
  ToOptionsElement,
  ToOptionsFromObjectElement
} from './select-control.element';
import { ValidatorElements } from './validators/validators';
import { ParsedElement } from '@rxap/xml-parser';
import { Constructor } from '@rxap/utilities';
import { FeatureElements } from './features/features';
import { Methods } from '@rxap-schematics/utilities';

export const Elements: Array<Constructor<ParsedElement>> = [
  CheckboxControlElement,
  ControlElement,
  FormElement,
  GroupControlElement,
  InputControlElement,
  SelectControlElement,
  DataSourceElement,
  OpenApiDataSourceElement,
  DataSourceTransformerElement,
  ToOptionsWithObjectElement,
  ToOptionsElement,
  ToOptionsFromObjectElement,
  ...ValidatorElements,
  ...FeatureElements,
  ...Methods
];
