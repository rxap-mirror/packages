import { Component } from '@angular/core';
import {
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import {
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { RxapFormControl } from '@rxap/forms';
import { TableSelectInputComponent } from './table-select-input.component';

@Component({
  imports: [TableSelectInputComponent, ReactiveFormsModule],
  template: `
    <rxap-table-select-input [formControl]="control" placeholder="Pick" required disabled></rxap-table-select-input>`,
})
class HostComponent {
  control: FormControl = new FormControl(null);
}

@Component({
  imports: [TableSelectInputComponent],
  template: `<rxap-table-select-input placeholder="Pick"></rxap-table-select-input>`,
})
class StandaloneHostComponent {}

describe('TableSelectInputComponent', () => {
  it('works standalone and shows the placeholder', () => {
    const fixture = TestBed.createComponent(StandaloneHostComponent);
    fixture.detectChanges();
    const input: TableSelectInputComponent = fixture.debugElement.children[0].componentInstance;
    expect(input.ngControl).toBeNull();
    expect(input.empty).toBe(true);
    expect(input.errorState).toBe(false);
    expect(input.placeholder).toBe('Pick');
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('Pick');
    expect(input.id).toMatch(/^rxap-table-select-input-\d+$/);
  });

  it('exposes inputs and state', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: TableSelectInputComponent = fixture.debugElement.children[0].componentInstance;
    expect(input.required).toBe(true);
    expect(input.disabled).toBe(true);
    expect(input.shouldLabelFloat).toBe(false);
    input.focused = true;
    expect(input.shouldLabelFloat).toBe(true);
    expect(fixture.nativeElement.querySelector('.mat-select-trigger').classList).toContain('disabled');
  });

  it('writes values and displays them', fakeAsync(() => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: TableSelectInputComponent = fixture.debugElement.children[0].componentInstance;
    const changes = jest.fn();
    input.stateChanges.subscribe(changes);
    fixture.componentInstance.control.setValue('abc');
    tick(100);
    fixture.detectChanges();
    expect(input.value).toBe('abc');
    expect(input.empty).toBe(false);
    expect(input.shouldLabelFloat).toBe(true);
    expect(input.display).toBe('abc');
    expect(fixture.nativeElement.querySelector('span').textContent).toBe('abc');
    fixture.componentInstance.control.setValue(null);
    tick(100);
    expect(input.display).toBe('');
    expect(changes).toHaveBeenCalled();
  }));

  it('setValue notifies the control', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: TableSelectInputComponent = fixture.debugElement.children[0].componentInstance;
    input.setValue({ a: 1 });
    expect(fixture.componentInstance.control.value).toEqual({ a: 1 });
    expect(input.value).toEqual({ a: 1 });
  });

  it('reports the error state', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentInstance.control.setErrors({ x: true });
    fixture.detectChanges();
    const input: TableSelectInputComponent = fixture.debugElement.children[0].componentInstance;
    expect(input.errorState).toBe(true);
  });

  it('allows overriding toDisplay and has no-op helpers', fakeAsync(() => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const input: TableSelectInputComponent = fixture.debugElement.children[0].componentInstance;
    input.toDisplay = (v: any) => `<${ v }>`;
    input.setDescribedByIds(['a']);
    input.onContainerClick(new MouseEvent('click'));
    fixture.componentInstance.control.setValue('x');
    tick(100);
    expect(input.display).toBe('<x>');
  }));

  it('follows the disabled state of rxap controls', fakeAsync(() => {
    @Component({
      imports: [TableSelectInputComponent, ReactiveFormsModule],
      template: `<rxap-table-select-input [formControl]="control"></rxap-table-select-input>`,
    })
    class RxapHost {
      control = new RxapFormControl<any>(null, { controlId: 'c' });
    }
    const fixture = TestBed.createComponent(RxapHost);
    fixture.detectChanges();
    const input: TableSelectInputComponent = fixture.debugElement.children[0].componentInstance;
    expect(input.rxapControl).toBe(fixture.componentInstance.control);
    fixture.componentInstance.control.disable();
    tick(100);
    expect(input.disabled).toBe(true);
    fixture.componentInstance.control.enable();
    tick(100);
    expect(input.disabled).toBe(false);
    fixture.destroy();
  }));
});
