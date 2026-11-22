import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IsEqualToDirective } from './is-equal-to';

@Component({
  imports: [ReactiveFormsModule, IsEqualToDirective],
  template: `<input [formControl]="control" [rxapIsEqualTo]="other()" />`,
})
class HostComponent {
  readonly control = new FormControl('abc');
  readonly other = signal<any>('abc');
}

describe('IsEqualToDirective', () => {
  function create() {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    return fixture;
  }

  it('is valid when the values are equal', () => {
    const f = create();
    expect(f.componentInstance.control.errors).toBeNull();
  });

  it('reports a mismatch', () => {
    const f = create();
    f.componentInstance.control.setValue('xyz');
    expect(f.componentInstance.control.errors).toEqual({
      isEqualTo: { value: 'abc', actualValue: 'xyz' },
    });
  });

  it('accepts null as always valid', () => {
    const f = create();
    f.componentInstance.other.set(null);
    f.detectChanges();
    f.componentInstance.control.setValue('anything');
    expect(f.componentInstance.control.errors).toBeNull();
  });

  it('revalidates when the compared value changes', () => {
    const f = create();
    f.componentInstance.other.set('other');
    f.detectChanges();
    expect(f.componentInstance.control.errors).not.toBeNull();
    f.componentInstance.other.set('abc');
    f.detectChanges();
    expect(f.componentInstance.control.errors).toBeNull();
  });
});
