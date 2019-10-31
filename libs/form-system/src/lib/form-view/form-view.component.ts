import {
  Component,
  OnInit,
  Input,
  Inject,
  Optional,
  ViewChild,
  ElementRef,
  OnDestroy
} from '@angular/core';
import { FormTemplateLoader } from '../form-template-loader';
import { FormInstanceFactory } from '../form-instance-factory';
import {
  RXAP_FORM_ID,
  RXAP_SHARED_FORM
} from '../tokens';
import { Layout } from './layout';
import {
  Subscription,
  Observable
} from 'rxjs';
import { tap } from 'rxjs/operators';
import { FormInstance } from '../form-instance';
import { Required } from '@rxap/utilities';
import { FormInvalidSubmitService } from '../form-invalid-submit.service';
import { FormValidSubmitService } from '../form-valid-submit.service';
import { FormLoadService } from '../form-load.service';

@Component({
  selector: 'rxap-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss']
})
export class FormViewComponent<FormValue extends object>
  implements OnInit, OnDestroy {

  @ViewChild('submitButton', { static: true }) public submitButton!: ElementRef;
  @ViewChild('resetButton', { static: true }) public resetButton!: ElementRef;

  @Input() @Required public formId!: string;

  public layout$!: Observable<Layout>;
  public instance!: FormInstance<FormValue>;

  public subscriptions = new Subscription();

  constructor(
    public readonly formTemplateLoader: FormTemplateLoader,
    public readonly formInstanceFactory: FormInstanceFactory,
    public readonly formInvalidSubmit: FormInvalidSubmitService<FormValue>,
    public readonly formValidSubmit: FormValidSubmitService<FormValue>,
    public readonly formLoad: FormLoadService<FormValue>,
    @Inject(RXAP_FORM_ID) @Optional() formId: string | null               = null,
    @Inject(RXAP_SHARED_FORM) @Optional() public readonly shared: boolean = true
  ) {
    if (formId) {
      this.formId = formId;
    }
  }

  public ngOnInit(): void {
    this.layout$  = this.formTemplateLoader.getLayout$(this.formId);
    this.instance = this.formInstanceFactory.buildInstance<FormValue>(
      this.formId,
      this.shared,
      this.formInvalidSubmit,
      this.formValidSubmit,
      this.formLoad
    );

    this.subscriptions.add(
      this.instance.clickSubmit$.pipe(
        tap(() => this.clickSubmitButton()),
      ).subscribe()
    );

    this.subscriptions.add(
      this.instance.clickReset$.pipe(
        tap(() => this.clickResetButton()),
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
