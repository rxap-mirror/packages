import { Injector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RXAP_FORM_DEFINITION } from '@rxap/forms';
import { FormFactory, SearchForm, SearchFormProviders } from './search.form';

describe('SearchForm', () => {
  it('FormFactory returns an existing form definition', () => {
    const existing = {} as SearchForm;
    expect(FormFactory(TestBed.inject(Injector), null, existing)).toBe(existing);
  });

  it('FormFactory builds a new form with the initial state', () => {
    const form = FormFactory(TestBed.inject(Injector), { search: 'abc', scope: {} }, null);
    expect(form.rxapFormGroup.get('search')?.value).toBe('abc');
    expect(form.rxapFormGroup.get('scope')).toBeTruthy();
  });

  it('provides the form definition', () => {
    TestBed.configureTestingModule({ providers: SearchFormProviders });
    const form = TestBed.inject(RXAP_FORM_DEFINITION) as SearchForm;
    expect(form.rxapFormGroup.get('search')).toBeTruthy();
  });
});
