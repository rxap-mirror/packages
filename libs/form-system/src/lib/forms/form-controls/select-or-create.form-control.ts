import { SelectFormControl } from './select.form-control';
import { FormId } from '../../form-instance-factory';

export class SelectOrCreateFormControl<ControlValue>
  extends SelectFormControl<ControlValue> {

  public createFormId: FormId | null = null;

}
