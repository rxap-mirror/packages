import { MaxElement } from './max.element';
import { MinElement } from './min.element';
import { PatternElement } from './pattern.element';
import { ValidatorElement } from './validator.element';
import { AngularValidatorElement } from './angular-validator.element';
import { ParsedElement } from '@rxap/xml-parser';
import { Constructor } from '@rxap/utilities';

export const ValidatorElements: Array<Constructor<ParsedElement>> = [
  MaxElement,
  MinElement,
  PatternElement,
  ValidatorElement,
  AngularValidatorElement
];
