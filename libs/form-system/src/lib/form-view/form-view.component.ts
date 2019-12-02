import {
  Component,
  OnInit,
  Input,
  Inject,
  Optional,
  ViewChild,
  ElementRef,
  OnDestroy,
  Injector,
  ChangeDetectionStrategy,
  Injectable
} from '@angular/core';
import { FormTemplateLoader } from '../form-template-loader';
import { FormInstanceFactory } from '../form-instance-factory';
import {
  RXAP_FORM_ID,
  RXAP_FORM_INSTANCE_ID
} from '../tokens';
import {
  Subscription,
  Observable
} from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  FormInstance,
  FormInstanceId
} from '../form-instance';
import {
  Required,
  Type
} from '@rxap/utilities';
import { FormInvalidSubmitService } from '../form-invalid-submit.service';
import { FormValidSubmitService } from '../form-valid-submit.service';
import { FormLoadService } from '../form-load.service';
import {
  Control,
  CheckboxControl,
  DateControl,
  SelectOrCreateControl,
  SelectControl,
  FormFieldControl,
  InputControl,
  RadioControl,
  SelectListControl,
  TextareaControl
} from './control';
import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import { InputFormControl } from '../forms/form-controls/input.form-control';
import { SelectFormControl } from '../forms/form-controls/select.form-control';
import { FormStateManager } from '../form-state-manager';
import { SelectListFormControl } from '../forms/form-controls/select-list.form-control';
import { RadioButtonFormControl } from '../forms/form-controls/radio-button.form-control';
import { SelectOrCreateFormControl } from '../forms/form-controls/select-or-create.form-control';
import { CheckboxFormControl } from '../forms/form-controls/checkbox.form-control';
import { DateFormControl } from '../forms/form-controls/date.form-control';
import { FormFieldFormControl } from '../forms/form-controls/form-field.form-control';
import { TextareaFormControl } from '../forms/form-controls/textarea-form.control';
import { Form } from './form';

@Injectable({ providedIn: 'root' })
export class SyncLayoutAndFormDefinition {

  constructor(public formStateManager: FormStateManager) {}

  public sync(form: Form, rootGroup: BaseFormGroup<any>) {
    form.controls.forEach((control: Control) => {
      let group       = rootGroup;
      const fragments = control.controlPath.split('.');
      fragments.shift();
      for (let i = 0; i < fragments.length; i++) {
        const fragment = fragments[ i ];
        if (group.hasControl(fragment)) {
          group = group.getControl(fragment) as any;
          if (i === fragments.length - 1) {
            this.updateControl(group as any, control);
          }
        } else {
          if (i === fragments.length - 1) {
            this.addNewControl(group, control);
          } else {
            group = this.addNewGroup(group, fragment);
          }
        }
      }
    });
  }

  public updateControl(formControl: BaseFormControl<any>, control: Control): void {

    if (control instanceof CheckboxControl && formControl instanceof CheckboxFormControl) {
      formControl.indeterminate = control.indeterminate;
      formControl.labelPosition = control.labelPosition;
    }

    if (control instanceof FormFieldControl && formControl instanceof FormFieldFormControl) {
      formControl.appearance = control.appearance;
    }

    if (control instanceof DateControl && formControl instanceof DateFormControl) {
      formControl.startAt   = control.startAt || null;
      formControl.startView = control.startView;
    }

    if (control instanceof InputControl && formControl instanceof InputFormControl) {
      formControl.min     = control.min || null;
      formControl.max     = control.max || null;
      formControl.pattern = control.pattern as any || null;
      formControl.type    = control.type;
    }

    if (control instanceof RadioControl && formControl instanceof RadioButtonFormControl) {
      formControl.color         = control.color;
      formControl.labelPosition = control.labelPosition;
    }

    if (control instanceof SelectControl && formControl instanceof SelectFormControl) {
      if (control.options) {
        formControl.options = control.options;
      }
      formControl.multiple = control.multiple;
    }

    if (control instanceof SelectListControl && formControl instanceof SelectListFormControl) {
      formControl.checkboxPosition = control.checkboxPosition;
    }

    if (control instanceof SelectOrCreateControl && formControl instanceof SelectOrCreateFormControl) {
      formControl.createFormId = control.createFormId;
    }

    if (control instanceof TextareaControl && formControl instanceof TextareaFormControl) {
      formControl.maxRows  = control.maxRows as any;
      formControl.minRows  = control.minRows as any;
      formControl.autosize = control.autosize;
    }

  }

  public addNewControl(group: BaseFormGroup<any>, control: Control): void {
    let formControlTyp: Type<BaseFormControl<any>>;

    // create new without parent to prevent that the control is been used before initialized
    switch (control.controlTypId) {

      case 'checkbox':
        formControlTyp = CheckboxFormControl;
        break;

      case 'date':
        formControlTyp = DateFormControl;
        break;

      case 'select':
        formControlTyp = SelectFormControl;
        break;

      case 'radio':
        formControlTyp = RadioButtonFormControl;
        break;

      case 'select-list':
        formControlTyp = SelectListFormControl;
        break;

      case 'select-or-create':
        formControlTyp = SelectOrCreateFormControl;
        break;

      case 'textarea':
        formControlTyp = TextareaFormControl;
        break;

      default:
        formControlTyp = InputFormControl;
        break;

    }

    const formControl: BaseFormControl<any> = new formControlTyp(control.id, null, group.injector);

    this.updateControl(formControl, control);

    this.formStateManager.addForm([ group.formId, formControl.controlPath ].join('.'), formControl);

    group.addControl(formControl);

    formControl.rxapOnInit();

  }

  public addNewGroup(group: BaseFormGroup<any>, fragment: string): BaseFormGroup<any> {
    const newGroup = new BaseFormGroup(group.formId, fragment, null, group.injector, null);
    this.formStateManager.addForm([ group.formId, newGroup.controlPath ].join('.'), newGroup);
    group.addControl(newGroup);
    newGroup.rxapOnInit();
    return newGroup;
  }

}

@Component({
  selector:        'rxap-form-view',
  templateUrl:     './form-view.component.html',
  styleUrls:       [ './form-view.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormViewComponent<FormValue extends object>
  implements OnInit, OnDestroy {

  @ViewChild('submitButton', { static: true }) public submitButton!: ElementRef;
  @ViewChild('resetButton', { static: true }) public resetButton!: ElementRef;

  @Input() @Required public formId!: string;

  @Input() public instanceId!: FormInstanceId;

  public formTemplate$!: Observable<Form>;
  public instance!: FormInstance<FormValue>;

  public subscriptions = new Subscription();

  constructor(
    public readonly formTemplateLoader: FormTemplateLoader,
    public readonly formInstanceFactory: FormInstanceFactory,
    public readonly formInvalidSubmit: FormInvalidSubmitService<FormValue>,
    public readonly formValidSubmit: FormValidSubmitService<FormValue>,
    public readonly formLoad: FormLoadService<FormValue>,
    public readonly injector: Injector,
    public readonly syncLayoutAndFormDefinition: SyncLayoutAndFormDefinition,
    @Inject(RXAP_FORM_ID) @Optional() formId: string | null                      = null,
    @Inject(RXAP_FORM_INSTANCE_ID) @Optional() instanceId: FormInstanceId | null = null
  ) {
    if (formId) {
      this.formId = formId;
    }
    if (instanceId) {
      this.instanceId = instanceId || this.formId;
    }
  }

  public ngOnInit(): void {
    if (!this.instanceId) {
      this.instanceId = this.formId;
    }

    this.instance = this.formInstanceFactory.buildInstance<FormValue>(
      this.formId,
      this.instanceId,
      this.injector,
      this.formInvalidSubmit,
      this.formValidSubmit,
      this.formLoad
    );

    this.formTemplate$ = this.formTemplateLoader.getFormTemplate$(this.formId).pipe(
      tap(form => this.syncLayoutAndFormDefinition.sync(form, this.instance.formDefinition.group))
    );

    this.subscriptions.add(
      this.instance.clickSubmit$.pipe(
        tap(() => this.clickSubmitButton())
      ).subscribe()
    );

    this.subscriptions.add(
      this.instance.clickReset$.pipe(
        tap(() => this.clickResetButton())
      ).subscribe()
    );

    this.instance.rxapOnInit();
  }

  public clickSubmitButton() {
    this.submitButton.nativeElement.click();
  }

  public clickResetButton() {
    this.resetButton.nativeElement.click();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.instance.rxapOnDestroy();
  }

}
