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
import {
  FormInstanceFactory
} from '../form-instance-factory';
import { RXAP_FORM_ID } from '../tokens';
import { Layout } from './layout';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { NgForm } from '@angular/forms';
import { FormInstance } from '../form-instance';

@Component({
  selector: 'rxap-form-view',
  templateUrl: './form-view.component.html',
  styleUrls: ['./form-view.component.scss']
})
export class FormViewComponent<FormValue extends object>
  implements OnInit, OnDestroy {

  @ViewChild('submitButton', { static: true }) public submitButton: ElementRef;
  @ViewChild('resetButton', { static: true }) public resetButton: ElementRef;
  @ViewChild('form', { static: true }) public form: NgForm;

  @Input() public formId: string | null = null;

  public layout: Layout;
  public instance: FormInstance<FormValue>;

  public subscriptions = new Subscription();

  constructor(
    public readonly formTemplateLoader: FormTemplateLoader,
    public readonly formInstanceFactory: FormInstanceFactory,
    @Inject(RXAP_FORM_ID) @Optional() formId: string | null = null,
  ) {
    this.formId = formId;
  }

  public ngOnInit(): void {
    this.layout = this.formTemplateLoader.getLayout(this.formId);
    this.instance = this.formInstanceFactory.buildInstance<FormValue>(this.formId);

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
