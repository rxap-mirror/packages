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
  ChangeDetectionStrategy
} from '@angular/core';
import { FormTemplateLoader } from '../form-template-loader';
import { FormInstanceFactory } from '../form-instance-factory';
import {
  RXAP_FORM_ID,
  RXAP_FORM_INSTANCE_ID
} from '../tokens';
import { Layout } from './layout';
import {
  Subscription,
  Observable
} from 'rxjs';
import { tap } from 'rxjs/operators';
import {
  FormInstance,
  FormInstanceId
} from '../form-instance';
import { Required } from '@rxap/utilities';
import { FormInvalidSubmitService } from '../form-invalid-submit.service';
import { FormValidSubmitService } from '../form-valid-submit.service';
import { FormLoadService } from '../form-load.service';
import { Control } from './control';
import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { BaseFormControl } from '../forms/form-controls/base.form-control';
import { InputFormControl } from '../forms/form-controls/input.form-control';
import { SelectFormControl } from '../forms/form-controls/select.form-control';

export class SyncLayoutAndFormDefinition {

  constructor(public layout: Layout, public rootGroup: BaseFormGroup<any>) {}

  public sync() {
    this.layout.controls.forEach((control: Control) => {
      let group       = this.rootGroup;
      const fragments = control.controlPath.split('.');
      // remove the formId
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

    switch (control.name) {

      case 'select':
        if (control.options) {
          (formControl as SelectFormControl<any>).options = control.options.items;
        }
        break;

    }

  }

  public addNewControl(group: BaseFormGroup<any>, control: Control): void {
    let formControl: BaseFormControl<any>;

    switch (control.name) {

      case 'select':
        formControl = new SelectFormControl(control.controlId, group, group.injector);
        break;

      default:
        formControl = new InputFormControl(control.controlId, group, group.injector);
        break;

    }

    this.updateControl(formControl, control);

  }

  public addNewGroup(group: BaseFormGroup<any>, fragment: string): BaseFormGroup<any> {
    return new BaseFormGroup(group.formId, fragment, null, group.injector, group);
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

  public layout$!: Observable<Layout>;
  public instance!: FormInstance<FormValue>;

  public subscriptions = new Subscription();

  constructor(
    public readonly formTemplateLoader: FormTemplateLoader,
    public readonly formInstanceFactory: FormInstanceFactory,
    public readonly formInvalidSubmit: FormInvalidSubmitService<FormValue>,
    public readonly formValidSubmit: FormValidSubmitService<FormValue>,
    public readonly formLoad: FormLoadService<FormValue>,
    public readonly injector: Injector,
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
    this.layout$  = this.formTemplateLoader.getLayout$(this.formId);
    this.instance = this.formInstanceFactory.buildInstance<FormValue>(
      this.formId,
      this.instanceId,
      this.injector,
      this.formInvalidSubmit,
      this.formValidSubmit,
      this.formLoad
    );

    this.subscriptions.add(
      this.layout$.pipe(
        tap(layout => new SyncLayoutAndFormDefinition(layout, this.instance.formDefinition.group).sync())
      ).subscribe()
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
