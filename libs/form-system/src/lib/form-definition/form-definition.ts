import { BaseFormGroup } from '../forms/form-groups/base.form-group';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RxapFormDefinition<GroupValue extends object> {

  public static TestInstance<FormValue extends object>() {
    return new RxapFormDefinition<FormValue>();
  }

  public group!: BaseFormGroup<GroupValue>;

  public submit$ = new Subject();
  public reset$ = new Subject();

  public validSubmit$ = new Subject();
  public invalidSubmit$ = new Subject();
  public init$ = new Subject();
  public destroy$ = new Subject();

  public rxapOnInit() {}

  public rxapOnDestroy() {}

  public rxapOnSubmit() {}

  public rxapOnSubmitValid() {}

  public rxapOnSubmitInvalid() {}

  public rxapOnSubmitError() {}
}
