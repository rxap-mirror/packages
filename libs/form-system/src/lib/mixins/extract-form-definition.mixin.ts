import {
  FormDefinition,
  AbstractControl,
} from '@rxap/forms';
import { RxapFormSystemError } from '../error';

export class ExtractFormDefinitionMixin {

  // TODO : change to AbstractControl from @rxap/forms
  protected extractFormDefinition(control: AbstractControl): FormDefinition {
    const formDefinition = control.rxapFormDefinition;

    if (!formDefinition) {
      throw new RxapFormSystemError('Could not find the form definition instance', '');
    }

    return formDefinition;
  }

}
