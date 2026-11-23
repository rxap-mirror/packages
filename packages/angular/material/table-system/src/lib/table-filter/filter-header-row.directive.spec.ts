import { Component, INJECTOR, Injector, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { RxapForm, RxapFormBuilder, RxapFormControl, RxapFormGroup, UseFormControl } from '@rxap/forms';
import { FilterHeaderRowDirective } from './filter-header-row.directive';
import { TableFilterService } from './table-filter.service';
import { RXAP_TABLE_FILTER_FORM_DEFINITION } from './tokens';

@RxapForm('filter-header-row-test')
class FilterForm {
  public rxapFormGroup!: RxapFormGroup;

  @UseFormControl()
  public name!: RxapFormControl<string>;
}

function buildDefinition() {
  return new RxapFormBuilder<any>(FilterForm as any, TestBed.inject(INJECTOR) as Injector).build();
}

@Component({
  standalone: true,
  imports: [FilterHeaderRowDirective, ReactiveFormsModule],
  providers: [TableFilterService],
  template: `<table [rxap-filter-header-row]="definition"></table>`,
})
class AliasHostComponent {
  definition: any = buildDefinition();
  readonly directive = viewChild.required(FilterHeaderRowDirective);
}

@Component({
  standalone: true,
  imports: [FilterHeaderRowDirective, ReactiveFormsModule],
  providers: [TableFilterService],
  template: `<table rxap-filter-header-row></table>`,
})
class TokenHostComponent {
  readonly directive = viewChild.required(FilterHeaderRowDirective);
}

describe('FilterHeaderRowDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AliasHostComponent, TokenHostComponent],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('uses the form definition bound to the rxap-filter-header-row alias input', () => {
    const fixture = TestBed.createComponent(AliasHostComponent);
    fixture.detectChanges();
    const directive = fixture.componentInstance.directive();
    expect(directive.formDefinition).toBe(fixture.componentInstance.definition);
    expect(directive.form).toBe(fixture.componentInstance.definition.rxapFormGroup);
    expect(fixture.debugElement.query(By.directive(FilterHeaderRowDirective))).toBeTruthy();
  });

  it('falls back to the RXAP_TABLE_FILTER_FORM_DEFINITION token', () => {
    const definition = buildDefinition();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [TokenHostComponent],
      providers: [{ provide: RXAP_TABLE_FILTER_FORM_DEFINITION, useValue: definition }],
    });
    const fixture = TestBed.createComponent(TokenHostComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance.directive().formDefinition).toBe(definition);
  });

  it('throws without any form definition', () => {
    const fixture = TestBed.createComponent(TokenHostComponent);
    expect(() => fixture.detectChanges()).toThrow();
  });

  it('forwards debounced form values to the table filter service', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(AliasHostComponent);
    fixture.detectChanges();
    const filter = fixture.debugElement.injector.get(TableFilterService);
    const spy = vi.spyOn(filter, 'setMap');
    const group = fixture.componentInstance.definition.rxapFormGroup;
    group.get('name')!.setValue('abc');
    await vi.advanceTimersByTimeAsync(999);
    expect(spy).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ name: 'abc' }));
    fixture.destroy();
  });

  it('resets the form when the filter is reset', async () => {
    vi.useFakeTimers();
    const fixture = TestBed.createComponent(AliasHostComponent);
    fixture.detectChanges();
    const filter = fixture.debugElement.injector.get(TableFilterService);
    const group = fixture.componentInstance.definition.rxapFormGroup;
    const reset = vi.spyOn(group, 'reset');
    filter.reset();
    expect(reset).toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000);
    fixture.destroy();
  });
});
