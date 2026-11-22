import { RXAP_TABLE_FILTER_FORM_DEFINITION } from '@rxap/material-table-system';
import { CreateFilterFormProvider } from './create-filter-form-provider';

describe('CreateFilterFormProvider', () => {
  it('creates controls for filterable columns only', () => {
    const provider: any = CreateFilterFormProvider(new Map<string, any>([
      ['name', { label: 'Name', filter: true }],
      ['age', { label: 'Age' }],
      ['city', { label: 'City', filter: true }],
    ]));
    expect(provider.provide).toBe(RXAP_TABLE_FILTER_FORM_DEFINITION);
    const form = provider.useValue;
    expect(form.name).toBeDefined();
    expect(form.city).toBeDefined();
    expect(form.age).toBeUndefined();
    expect(Object.keys(form.rxapFormGroup.controls)).toEqual(['name', 'city']);
    expect(form.rxapFormGroup.rxapFormDefinition).toBe(form);
    expect(form.rxapMetadata).toEqual({ controlId: 'filter' });
    expect(form.name.controlId).toBe('name');
  });

  it('creates an empty form', () => {
    const provider: any = CreateFilterFormProvider(new Map());
    expect(Object.keys(provider.useValue.rxapFormGroup.controls)).toEqual([]);
  });
});
