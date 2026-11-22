import { Component, INJECTOR, Injector, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatChipInput, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { UseHideFunction, UseShowFunction } from '@rxap/form-system';
import {
  FormDirective,
  RXAP_FORM_DEFINITION,
  RxapForm,
  RxapFormBuilder,
  RxapFormControl,
  RxapFormGroup,
  UseFormControl,
} from '@rxap/forms';
import { ChipInputAdapterDirective } from './chip-input-adapter.directive';
import { ChipListIteratorDirective } from './chip-list-iterator.directive';
import { CompareWithDirective } from './compare-with.directive';
import { ControlErrorDirective } from './control-error.directive';
import { ControlErrorsDirective } from './control-errors.directive';
import { FormFieldHideShowDirective } from './form-field-hide-show.directive';
import { InputClearButtonDirective } from './input-clear-button.directive';
import { RequiredDirective } from './required.directive';

describe('RequiredDirective', () => {
  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, RequiredDirective],
    template: `
      <mat-form-field>
        <input matInput [formControl]="control" rxapRequired />
      </mat-form-field>
    `,
  })
  class Host {
    control = new FormControl('', Validators.required);
  }

  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, RequiredDirective],
    template: `
      <mat-form-field>
        <input matInput [formControl]="control" rxapRequired />
      </mat-form-field>
    `,
  })
  class OptionalHost {
    control = new FormControl('');
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [Host, OptionalHost], providers: [provideNoopAnimations()] }));

  it('marks the control as required when it has a required validator', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.debugElement.query(By.css('input'));
    expect(input.nativeElement.required).toBe(true);
  });

  it('does not mark the control as required without validator', () => {
    const fixture = TestBed.createComponent(OptionalHost);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('input')).nativeElement.required).toBe(false);
  });
});

describe('InputClearButtonDirective', () => {
  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, InputClearButtonDirective],
    template: `
      <mat-form-field>
        <input matInput [formControl]="control" />
        <button matSuffix rxapInputClearButton>x</button>
      </mat-form-field>
    `,
  })
  class Host {
    control = new FormControl('abc');
  }

  @Component({
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, InputClearButtonDirective],
    template: `
      <mat-form-field>
        <input matInput value="abc" />
        <button matSuffix rxapInputClearButton>x</button>
      </mat-form-field>
    `,
  })
  class PlainHost {}

  beforeEach(() => TestBed.configureTestingModule({ imports: [Host, PlainHost], providers: [provideNoopAnimations()] }));

  it('clears the control value on click', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.directive(InputClearButtonDirective));
    expect(button.nativeElement.getAttribute('type')).toBe('button');
    expect(button.nativeElement.getAttribute('tabindex')).toBe('-1');
    button.nativeElement.click();
    expect(fixture.componentInstance.control.value).toBeNull();
  });

  it('is disabled with the control', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('button')).nativeElement.disabled).toBe(true);
  });

  it('is disabled with the control without an explicit change detection run', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const button = fixture.debugElement.query(By.css('button')).nativeElement;
    expect(button.disabled).toBe(false);
    // e.g. disabled from an async callback: only the zoneless scheduler can refresh the host binding
    setTimeout(() => fixture.componentInstance.control.disable());
    await new Promise((resolve) => setTimeout(resolve, 10));
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    fixture.componentInstance.control.enable();
    await fixture.whenStable();
    expect(button.disabled).toBe(false);
  });

  it('resets a control without a form control', () => {
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(PlainHost);
    fixture.detectChanges();
    const directive = fixture.debugElement.query(By.directive(InputClearButtonDirective)).injector.get(InputClearButtonDirective);
    directive.onClick();
    expect(fixture.debugElement.query(By.css('input')).nativeElement.value).toBe('');
  });
});

describe('ControlError(s)Directive', () => {
  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, ControlErrorsDirective, ControlErrorDirective],
    template: `
      <mat-form-field>
        <input matInput [formControl]="control" />
        <span *rxapControlErrors="let errors; let c = control" class="all">{{ keys(errors) }}</span>
        <span *rxapControlError="let e; let c = control; key: 'REQUIRED'" class="one">required</span>
        <span *rxapControlError="let e; key: 'minlength'" class="min">min {{ e.requiredLength }}</span>
      </mat-form-field>
    `,
  })
  class Host {
    control = new FormControl('', [Validators.required, Validators.minLength(3)]);
    keys = (e: any) => Object.keys(e).join(',');
  }

  @Component({
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, ControlErrorsDirective],
    template: `<mat-form-field><input matInput /><span *rxapControlErrors="let e"></span></mat-form-field>`,
  })
  class NoControlHost {}

  @Component({
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, ControlErrorDirective],
    template: `<mat-form-field><input matInput /><span *rxapControlError="let e; key: 'x'"></span></mat-form-field>`,
  })
  class NoControlSingleHost {}

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [Host, NoControlHost, NoControlSingleHost],
      providers: [provideNoopAnimations()],
    }),
  );

  it('renders all errors', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    control.markAsTouched();
    control.updateValueAndValidity();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.all')?.textContent).toBe('required');
    control.setValue('a');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.all')?.textContent).toBe('minlength');
    control.setValue('abc');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.all')).toBeNull();
  });

  it('renders single errors case insensitive by key', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const control = fixture.componentInstance.control;
    control.markAsTouched();
    control.updateValueAndValidity();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.one')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.min')).toBeNull();
    control.setValue('a');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.one')).toBeNull();
    expect(fixture.nativeElement.querySelector('.min').textContent).toBe('min 3');
    fixture.destroy();
  });

  it('throws without an associated control', () => {
    expect(() => TestBed.createComponent(NoControlHost).detectChanges()).toThrow('has not a control');
    expect(() => TestBed.createComponent(NoControlSingleHost).detectChanges()).toThrow('has not a control');
  });
});

describe('CompareWithDirective', () => {
  @Component({
    standalone: true,
    imports: [MatFormFieldModule, MatSelectModule, CompareWithDirective],
    template: `<mat-select [rxapCompareWith]="path"></mat-select>`,
  })
  class Host {
    path = 'id';
    select = viewChild.required(MatSelect);
  }

  function compare(path: string) {
    TestBed.configureTestingModule({ imports: [Host], providers: [provideNoopAnimations()] });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.path = path;
    fixture.detectChanges();
    return fixture.componentInstance.select().compareWith;
  }

  beforeEach(() => jest.spyOn(console, 'warn').mockImplementation(() => undefined));

  it('compares by object path', () => {
    const fn = compare('id');
    expect(fn({ id: 1, a: 1 }, { id: 1, a: 2 })).toBe(true);
    expect(fn({ id: 1 }, { id: 2 })).toBe(false);
    expect(fn({ x: 1 }, { id: 2 })).toBe(false);
  });

  it('rejects non objects and null values', () => {
    const fn = compare('id');
    expect(fn(1, 2)).toBe(false);
    expect(fn(null, {})).toBe(false);
    expect(fn({}, undefined)).toBe(false);
  });

  it('compares deeply without a path', () => {
    const fn = compare('');
    expect(fn({ a: [1] }, { a: [1] })).toBe(true);
    expect(fn({ a: 1 }, { a: 2 })).toBe(false);
  });
});

describe('ChipInputAdapterDirective / ChipListIteratorDirective', () => {
  @Component({
    standalone: true,
    imports: [
      ReactiveFormsModule,
      MatFormFieldModule,
      MatChipsModule,
      ChipInputAdapterDirective,
      ChipListIteratorDirective,
    ],
    template: `
      <mat-form-field>
        <mat-chip-grid #grid [formControl]="control">
          <mat-chip-row *rxapChipListIterator="let item; let onRemoved = onRemoved" [value]="item" (removed)="onRemoved($event)">
            {{ item }}
          </mat-chip-row>
          <input [matChipInputFor]="grid" rxapChipInputAdapter [formControl]="control" />
        </mat-chip-grid>
      </mat-form-field>
    `,
  })
  class Host {
    control = new FormControl<string[]>(['a', 'b']);
    chipInput = viewChild.required(MatChipInput);
  }

  beforeEach(() => TestBed.configureTestingModule({ imports: [Host], providers: [provideNoopAnimations()] }));

  it('configures the chip input', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.componentInstance.chipInput();
    expect(input.addOnBlur).toBe(true);
    expect(input.separatorKeyCodes).toEqual([13, 188]);
  });

  it('renders a chip for each value and reacts to changes', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const chips = () => fixture.debugElement.queryAll(By.css('mat-chip-row')).map((c) => c.nativeElement.textContent.trim());
    expect(chips()).toEqual(['a', 'b']);
    fixture.componentInstance.control.setValue(['b', 'c', 'a']);
    fixture.detectChanges();
    expect(chips()).toEqual(['b', 'c', 'a']);
    fixture.componentInstance.control.setValue(['c']);
    fixture.detectChanges();
    expect(chips()).toEqual(['c']);
  });

  it('renders the chips of a programmatic value change without an explicit change detection run', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const chips = () => fixture.debugElement.queryAll(By.css('mat-chip-row')).map((c) => c.nativeElement.textContent.trim());
    expect(chips()).toEqual(['a', 'b']);
    setTimeout(() => fixture.componentInstance.control.setValue(['x', 'y', 'z']));
    await new Promise((resolve) => setTimeout(resolve, 10));
    await fixture.whenStable();
    expect(chips()).toEqual(['x', 'y', 'z']);
  });

  it('adds unique values on chipEnd and clears the input', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const input = fixture.componentInstance.chipInput();
    const clear = jest.spyOn(input, 'clear');
    input.chipEnd.emit({ value: ' ', input: input.inputElement, chipInput: input } as any);
    expect(fixture.componentInstance.control.value).toEqual(['a', 'b']);
    input.chipEnd.emit({ value: 'c', input: input.inputElement, chipInput: input } as any);
    input.chipEnd.emit({ value: 'a', input: input.inputElement, chipInput: input } as any);
    expect(fixture.componentInstance.control.value).toEqual(['a', 'b', 'c']);
    expect(clear).toHaveBeenCalledTimes(2);
  });

  it('removes a value when a chip is removed', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const chip = fixture.debugElement.queryAll(By.css('mat-chip-row'))[0];
    chip.triggerEventHandler('removed', { chip: { value: 'a' } });
    expect(fixture.componentInstance.control.value).toEqual(['b']);
  });
});

describe('FormFieldHideShowDirective', () => {
  @RxapForm('hide-show-test')
  class TestForm {
    public rxapFormGroup!: RxapFormGroup;

    @UseFormControl()
    public toggle!: RxapFormControl<boolean>;

    @UseFormControl()
    @UseShowFunction(function (this: any, control) {
      const value = control.parent!.get('toggle')!.value;
      return value === null ? null : !!value;
    })
    public shown!: RxapFormControl<string>;

    @UseFormControl()
    @UseHideFunction(function (this: any, control) {
      const value = control.parent!.get('toggle')!.value;
      return value === null ? null : !!value;
    })
    public hidden!: RxapFormControl<string>;

    @UseFormControl()
    @UseShowFunction(() => {
      throw new Error('boom');
    })
    public broken!: RxapFormControl<string>;

    @UseFormControl()
    public plain!: RxapFormControl<string>;
  }

  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, FormDirective, MatFormFieldModule, MatInputModule, FormFieldHideShowDirective],
    providers: [
      {
        provide: RXAP_FORM_DEFINITION,
        useFactory: (injector: Injector) => new RxapFormBuilder<any>(TestForm, injector).build(),
        deps: [INJECTOR],
      },
    ],
    template: `
      <form rxapForm>
        <mat-form-field rxapHideShow id="shown"><input matInput formControlName="shown" /></mat-form-field>
        <mat-form-field rxapHideShow id="hidden"><input matInput formControlName="hidden" /></mat-form-field>
        <mat-form-field rxapHideShow id="broken"><input matInput formControlName="broken" /></mat-form-field>
        <mat-form-field rxapHideShow id="plain"><input matInput formControlName="plain" /></mat-form-field>
        <mat-form-field><input matInput formControlName="toggle" /></mat-form-field>
      </form>
    `,
  })
  class Host {
    form = viewChild.required(FormDirective);
  }

  @Component({
    standalone: true,
    imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, FormFieldHideShowDirective],
    template: `<mat-form-field rxapHideShow><input matInput [formControl]="control" /></mat-form-field>`,
  })
  class PlainControlHost {
    control = new FormControl('');
  }

  @Component({
    standalone: true,
    imports: [MatFormFieldModule, MatInputModule, FormFieldHideShowDirective],
    template: `<mat-form-field rxapHideShow><input matInput /></mat-form-field>`,
  })
  class NoControlHost {}

  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [Host, PlainControlHost, NoControlHost],
      providers: [provideNoopAnimations()],
    }),
  );

  it('shows and hides form fields depending on the control state', () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const style = (id: string) => fixture.nativeElement.querySelector('#' + id).style.display;
    const form = fixture.componentInstance.form().form;
    // initial: toggle is null -> reset
    expect(style('shown')).toBe('');
    expect(style('hidden')).toBe('');
    expect(style('plain')).toBe('');
    form.get('toggle')!.setValue(true);
    expect(style('shown')).toBe('block');
    expect(style('hidden')).toBe('none');
    form.get('toggle')!.setValue(false);
    expect(style('shown')).toBe('none');
    expect(style('hidden')).toBe('block');
    expect(console.error).toHaveBeenCalled();
    fixture.destroy();
  });

  it('throws for a control that is not a RxapFormControl', () => {
    expect(() => TestBed.createComponent(PlainControlHost).detectChanges()).toThrow('not a RxapFormControl');
  });

  it('throws without a control', () => {
    expect(() => TestBed.createComponent(NoControlHost).detectChanges()).toThrow('has not a control');
  });
});
