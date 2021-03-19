import { MaxElement } from './max.element';
import { MinElement } from './min.element';
import { PatternElement } from './pattern.element';
import { ValidatorElement } from './validator.element';
import { AngularValidatorElement } from './angular-validator.element';
import { ParsedElement } from '@rxap/xml-parser';
import { Constructor } from '@rxap/utilities';
import { EmailElement } from './email.element';
import { MinLengthElement } from './min-length.element';
import { MaxLengthElement } from './max-length.element';
import { RequiredElement } from './required.element';
import { RequiredTrueElement } from './required-true.element';
import { IsNumberElement } from './is-number.element';

export const ValidatorElements: Array<Constructor<ParsedElement>> = [
  MaxElement,
  MinElement,
  PatternElement,
  ValidatorElement,
  AngularValidatorElement,
  EmailElement,
  MaxLengthElement,
  MinLengthElement,
  RequiredElement,
  RequiredTrueElement,
  IsNumberElement
];
