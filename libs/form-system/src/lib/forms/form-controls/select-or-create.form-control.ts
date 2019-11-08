import { SelectFormControl } from './select.form-control';
import { FormId } from '../../form-instance-factory';

export class SelectOrCreateFormControl<ControlValue>
  extends SelectFormControl<ControlValue> {

  public createFormId: FormId | null = null;

  public created(value: ControlValue) {
    this.selectOption(value);
    this.addOption({ value, display: this.toDisplay(value) });
    this.updateView$.next();
  }

  public toDisplay(value: ControlValue): string {
    if (typeof value === 'object') {
      if (value.hasOwnProperty('name')) {
        return (value as any)[ 'name' ];
      }
      if (value.hasOwnProperty('key')) {
        return (value as any)[ 'key' ];
      }
      return 'toDisplay method must be defined!';
    }
    return value + '';
  }

}
