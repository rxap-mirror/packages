import {
  ChangeDetectorRef,
  Directive,
  forwardRef,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
  Optional,
  SkipSelf
} from '@angular/core';
import {
  FormDirective,
  FormLoadFailedMethod,
  FormLoadSuccessfulMethod,
  FormSubmitFailedMethod,
  FormSubmitMethod,
  FormSubmitSuccessfulMethod,
  RXAP_FORM_DEFINITION_BUILDER,
  RXAP_FORM_LOAD_FAILED_METHOD,
  RXAP_FORM_LOAD_METHOD,
  RXAP_FORM_LOAD_SUCCESSFUL_METHOD,
  RXAP_FORM_SUBMIT_FAILED_METHOD,
  RXAP_FORM_SUBMIT_METHOD,
  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
  RxapFormBuilder
} from '@rxap/forms';
import { ControlContainer } from '@angular/forms';
import { LoadingIndicatorService } from '@rxap/services';
import { OverlaySizeConfig } from '@angular/cdk/overlay';
import { TableDataSourceDirective } from '@rxap/material-table-system';
import { Subscription } from 'rxjs';
import {
  skip,
  tap
} from 'rxjs/operators';
import {
  DefaultPopoverEditPositionStrategyFactory,
  PopoverEditPositionStrategyFactory
} from './cdk/popover-edit-position-strategy-factory';
import { MatPopoverEditModule } from './popover-edit-module';

export const RXAP_POPOVER_EDIT_FORM_DEFINITION_BUILDER = new InjectionToken<RxapFormBuilder>('rxap-popover-edit-form-definition-builder');
export const RXAP_POPOVER_EDIT_FORM_SUBMIT_METHOD      = new InjectionToken<RxapFormBuilder>('rxap-popover-edit-form-submit-method');

@Injectable()
export class RxapPopoverEditPositionStrategyFactory extends DefaultPopoverEditPositionStrategyFactory {

  public sizeConfigForCells(cells: HTMLElement[]): OverlaySizeConfig {
    const config = super.sizeConfigForCells(cells);
    return {
      ...config,
      width: typeof config.width === 'number' ? Math.max(config.width, 256) : config.width
    };
  }

}

@Directive({
  selector:   'form[rxapPopoverEditForm]:not([formGroup]):not([ngForm]),rxap-form,form[rxapPopoverEditForm]',
  providers:  [
    {
      provide: ControlContainer,
      // ignore coverage
      useExisting: forwardRef(() => PopoverEditFormDirective)
    },
    // region form provider clear
    // form provider that are directly associated with the current form
    // are cleared to prevent that inner forms can access this providers
    // Example: The parent form has a submit method provider and the inner should
    // not have a submit method provider. If the parent submit method provider is
    // not cleared then the inner form uses the parent submit method provider on
    // submit
    {
      provide:  RXAP_FORM_SUBMIT_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_LOAD_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_LOAD_FAILED_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_LOAD_SUCCESSFUL_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_SUBMIT_FAILED_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD,
      useValue: null
    },
    {
      provide:  RXAP_FORM_DEFINITION_BUILDER,
      useValue: null
    }
    // endregion
  ],
  host:       { '(reset)': 'onReset()' },
  outputs:    [ 'ngSubmit' ],
  exportAs:   'rxapPopoverEditForm',
  standalone: true
})
export class PopoverEditFormDirective extends FormDirective {

  private _submittingSubscription: Subscription;

  constructor(
    @Inject(ChangeDetectorRef)
    public readonly cdr: ChangeDetectorRef,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Inject(RXAP_POPOVER_EDIT_FORM_DEFINITION_BUILDER)
      formDefinitionBuilder: RxapFormBuilder,
    @SkipSelf()
    @Inject(RXAP_POPOVER_EDIT_FORM_SUBMIT_METHOD)
      submitMethod: FormSubmitMethod<any>,
    @Optional()
    @Inject(TableDataSourceDirective)
    private readonly tableDataSourceDirective: TableDataSourceDirective | null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_LOAD_FAILED_METHOD)
      loadFailedMethod: FormLoadFailedMethod | null             = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_LOAD_SUCCESSFUL_METHOD)
      loadSuccessfulMethod: FormLoadSuccessfulMethod | null     = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_SUBMIT_FAILED_METHOD)
      submitFailedMethod: FormSubmitFailedMethod | null         = null,
    // skip self, bc the token is set to null
    @SkipSelf()
    @Optional()
    @Inject(RXAP_FORM_SUBMIT_SUCCESSFUL_METHOD)
      submitSuccessfulMethod: FormSubmitSuccessfulMethod | null = null,
    @Optional()
    @Inject(LoadingIndicatorService)
      loadingIndicatorService: LoadingIndicatorService | null   = null
  ) {
    super(
      cdr,
      null,
      submitMethod,
      null,
      loadFailedMethod,
      loadSuccessfulMethod,
      submitFailedMethod,
      submitSuccessfulMethod,
      formDefinitionBuilder,
      loadingIndicatorService
    );
    this._submittingSubscription = this.submitting$.pipe(
      skip(1),
      tap(submitting => this.tableDataSourceDirective?.loading$.next(submitting))
    ).subscribe();
  }

  protected submitSuccessful(value: any) {
    super.submitSuccessful(value);
    this.tableDataSourceDirective?.refresh();
  }

  public ngOnDestroy() {
    super.ngOnDestroy();
    this._submittingSubscription.unsubscribe();
  }

}

@NgModule({
  imports:   [ PopoverEditFormDirective ],
  exports:   [
    PopoverEditFormDirective,
    MatPopoverEditModule
  ],
  providers: [
    {
      provide:  PopoverEditPositionStrategyFactory,
      useClass: RxapPopoverEditPositionStrategyFactory
    }
  ]
})
export class PopoverEditFormDirectiveModule {}
