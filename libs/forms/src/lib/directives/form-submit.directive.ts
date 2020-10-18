import {
  Directive,
  Inject,
  Input,
  OnDestroy,
  Optional,
  HostBinding,
  EventEmitter,
  Output
} from '@angular/core';
import {
  ConfirmClick,
  coerceBoolean
} from '@rxap/utilities';
import { FormDirective } from './form.directive';
import {
  first,
  tap
} from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Directive({
  selector: '[rxapFormSubmit]',
  host: {
    '(click)': 'onClick()',
    '(confirmed)': 'onConfirm()',
  }
})
export class FormSubmitDirective extends ConfirmClick implements OnDestroy {

  @HostBinding('type')
  @Input()
  public type: string = 'button'

  @Input('resetAfterSubmit')
  public set resetAfterSubmit(value: boolean | '') {
    this._resetAfterSubmit = coerceBoolean(value);
  }

  @Input()
  public navigateAfterSubmit?: string[];

  @Output()
  public afterSubmit = new EventEmitter();

  private _resetAfterSubmit: boolean = false;

  private subscription?: Subscription;

  constructor(
    @Inject(FormDirective) private readonly formDirective: FormDirective,
    @Optional()
    @Inject(Router)
    private readonly router: Router | null = null
  ) {
    super()
  }

  protected execute() {
    this.subscription = this.formDirective.rxapSubmit.pipe(
      first(),
      tap(event => {
        this.afterSubmit.emit(event);
        if (this._resetAfterSubmit) {
          this.formDirective.reset();
        }
        if (this.navigateAfterSubmit) {

          if (!this.router) {
            throw new Error('Could not resolve the router!');
          }

          return this.router.navigate(this.navigateAfterSubmit);
        }
        return Promise.resolve();
      })
    ).subscribe();
    this.formDirective.onSubmit(new Event('submit'));
  }

  public ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

}
