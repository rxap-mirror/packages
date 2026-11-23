import { ChangeDetectionStrategy, Component, INJECTOR, Injector, Provider } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { config } from 'rxjs';
import { RxapForm } from '../decorators/form';
import { UseFormControl } from '../decorators/use-form-control';
import { RxapFormBuilder } from '../form-builder';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { FormSubmitDirective } from './form-submit.directive';
import { FormDirective } from './form.directive';
import { RXAP_FORM_DEFINITION, RXAP_FORM_DEFINITION_BUILDER } from './tokens';

@RxapForm('submit-router-test')
class RouterForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public username!: RxapFormControl;
}

const formProviders: Provider[] = [
  RouterForm,
  {
    provide: RXAP_FORM_DEFINITION_BUILDER,
    useFactory: (injector: Injector) => new RxapFormBuilder<any>(RouterForm as any, injector),
    deps: [ INJECTOR ],
  },
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: (builder: RxapFormBuilder) => builder.build(),
    deps: [ RXAP_FORM_DEFINITION_BUILDER ],
  },
];

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ FormDirective, FormSubmitDirective ],
  providers: formProviders,
  template: `
    <form rxapForm>
      <button class="submit" rxapFormSubmit type="button" [navigateAfterSubmit]="['/target']">go</button>
    </form>`,
})
class RouterHost {
}

describe('FormSubmitDirective without a router', () => {

  afterEach(() => {
    config.onUnhandledError = null;
    vi.restoreAllMocks();
  });

  it('reports an error if navigateAfterSubmit is set but the router is not available', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const errors: unknown[] = [];
    config.onUnhandledError = (error) => {
      errors.push(error);
    };
    TestBed.configureTestingModule({ imports: [ RouterHost ], providers: [ { provide: Router, useValue: null } ] });
    const fixture = TestBed.createComponent(RouterHost);
    await fixture.whenStable();

    (fixture.nativeElement.querySelector('.submit') as HTMLButtonElement).click();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(errors).toHaveLength(1);
    expect((errors[0] as Error).message).toBe('Could not resolve the router!');
  });

});
