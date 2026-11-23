import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ControlValueAccessor } from './control-value-accessor';
import { FormControlErrorDirective } from './directives/form-control-error.directive';
import { ToFormMethod, ToFormSubmitMethod } from './directives/models';

class Cva extends ControlValueAccessor<string> {
  value: string | null = null;
  writeValue(v: string) {
    this.value = v;
  }
}

describe('ControlValueAccessor', () => {
  it('registers callbacks with noop defaults', () => {
    const c = new Cva();
    expect(() => { c.onChange!('x'); c.onTouched!(); c.setDisabledState!(true); }).not.toThrow();
    const change = vi.fn();
    const touched = vi.fn();
    c.registerOnChange(change);
    c.registerOnTouched(touched);
    c.onChange!('a');
    c.onTouched!();
    expect(change).toHaveBeenCalledWith('a');
    expect(touched).toHaveBeenCalled();
    c.writeValue('v');
    expect(c.value).toBe('v');
  });
});

describe('ToFormMethod', () => {
  it('wraps a function', () => {
    const fn = vi.fn(() => true);
    expect(ToFormMethod(fn).call(1 as never)).toBe(true);
    expect(ToFormSubmitMethod(fn).call(1)).toBe(true);
  });
});

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormControlErrorDirective],
  template: `
    <form [formGroup]="group">
      <p *rxapFormControlError="let e; from: 'name'; if: 'required'" class="err">{{ e }}</p>
    </form>`,
})
class ErrHost {
  group = new FormGroup({ name: new FormControl('', { validators: (c) => (c.value ? null : { required: 'REQ' }) }) });
}

@Component({
  standalone: true,
  imports: [ReactiveFormsModule, FormControlErrorDirective],
  template: `<form [formGroup]="group"><p *rxapFormControlError="let e; from: 'missing'; if: 'required'"></p></form>`,
})
class MissingHost {
  group = new FormGroup({});
}

describe('FormControlErrorDirective', () => {
  it('renders while the control has the error', async () => {
    TestBed.configureTestingModule({ imports: [ErrHost] });
    const f = TestBed.createComponent(ErrHost);
    f.detectChanges();
    await f.whenStable();
    f.detectChanges();
    expect(f.nativeElement.querySelector('.err')?.textContent).toBe('REQ');
    f.componentInstance.group.get('name')!.setValue('x');
    f.detectChanges();
    expect(f.nativeElement.querySelector('.err')).toBeNull();
    f.componentInstance.group.get('name')!.setValue('');
    f.detectChanges();
    expect(f.nativeElement.querySelector('.err')).toBeTruthy();
  });

  it('throws for unknown controls', () => {
    TestBed.configureTestingModule({ imports: [MissingHost] });
    const f = TestBed.createComponent(MissingHost);
    const errors: any[] = [];
    vi.spyOn(console, 'error').mockImplementation((e) => errors.push(e));
    expect(() => { f.detectChanges(); TestBed.tick(); }).toThrow('Could not extract form control instance');
  });
});
