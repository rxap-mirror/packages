import { BaseForm } from '../base.form';
import { Subject } from 'rxjs';
import { ParentForm } from '../parent.form';

export class BaseFormControl<ControlValue> extends BaseForm<ControlValue> {

  /**
   * the control input placeholder
   */
  public placeholder: string;

  /**
   * the control input label
   */
  public label: string;

  /**
   * weather this control is disabled
   */
  public disabled = false;

  /**
   * weather this control is readonly
   */
  public readonly = false;

  /**
   * weather this control is touched
   */
  public touched = false;

  public required = false;

  public dirty = false;

  public name: string;

  public componentId: string | null = null;

  public initial: ControlValue | null = null;

  /**
   * indicates that the component view must be updated
   */
  public updateView$ = new Subject<void>();

  constructor(controlId: string, parent: ParentForm<any>) {
    super(parent.formId, controlId, parent);
    this.placeholder = `FORMS.${this.controlPath}.PLACEHOLDER`;
    this.label       = `FORMS.${this.controlPath}.LABEL`;
    this.name        = [ this.formId, this.controlPath ].join('.');
  }

  public init() {
    super.init();
    this.setValue(this.initial);
  }

}
