import {
  Rule,
  SchematicsException,
} from '@angular-devkit/schematics';
import { NormalizedSelectFormControlOptions } from '../normalize-select-form-control-options';

export function openApiBackendOptionsRule(normalizedOptions: NormalizedSelectFormControlOptions): Rule {
  return () => {
    throw new SchematicsException('The open api backend is not supported yet!');
  };
}