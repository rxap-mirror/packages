import { Injectable, INJECTOR, Injector, Optional, Provider, SkipSelf } from '@angular/core';
import {
  FormType,
  RXAP_FORM_DEFINITION,
  RXAP_FORM_INITIAL_STATE,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';

export interface ISearchForm<Scope = unknown> {
  search: string;
  scope: Record<string, Scope[]>;
}

@RxapForm({
  id: 'search',
  autoSubmit: 500,
})
@Injectable()
export class SearchForm<Scope = unknown> implements FormType<ISearchForm<Scope>> {

  rxapFormGroup!: RxapFormGroup<ISearchForm<Scope>>;

  @UseFormControl()
  search!: RxapFormControl<string>;

  @UseFormControl()
  scope!: RxapFormControl<ISearchForm<Scope>['scope']>;

}

export function FormFactory(
  injector: Injector,
  state: ISearchForm | null,
  existingFormDefinition: SearchForm | null,
): SearchForm {
  if (existingFormDefinition) {
    return existingFormDefinition;
  }
  return new RxapFormBuilder<ISearchForm>(
    SearchForm,
    injector,
  ).build(state ?? {});
}

export const SearchFormProviders: Provider[] = [
  SearchForm,
  {
    provide: RXAP_FORM_DEFINITION,
    useFactory: FormFactory,
    deps: [
      INJECTOR,
      [ new Optional(), RXAP_FORM_INITIAL_STATE ],
      [ new SkipSelf(), new Optional(), RXAP_FORM_DEFINITION ],
    ],
  },
];
