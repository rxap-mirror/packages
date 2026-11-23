import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { FormControlNameDirective } from './form-control-name.directive';
import { FormGroupNameDirective } from './form-group-name.directive';

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ ReactiveFormsModule, FormControlNameDirective, FormGroupNameDirective ],
  template: `
    <form [formGroup]="form">
      <input class="username" ngDefaultControl rxapFormControlName="username" />
      <div rxapFormGroupName="address">
        <input class="zip" ngDefaultControl rxapFormControlName="zip" />
      </div>
    </form>`,
})
class NameDirectivesHost {
  readonly username = new RxapFormControl<string>('initial', { controlId: 'username' });
  readonly zip = new RxapFormControl<string>('12345', { controlId: 'zip' });
  readonly address = new RxapFormGroup<any>({ zip: this.zip }, { controlId: 'address' });
  readonly form = new RxapFormGroup<any>({ username: this.username, address: this.address }, { controlId: 'root' });
}

describe('FormControlNameDirective / FormGroupNameDirective', () => {

  let fixture: ComponentFixture<NameDirectivesHost>;
  let host: NameDirectivesHost;

  const input = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLInputElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [ NameDirectivesHost ] });
    fixture = TestBed.createComponent(NameDirectivesHost);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('writes the control values to the inputs', () => {
    expect(input('.username').value).toBe('initial');
    expect(input('.zip').value).toBe('12345');
  });

  it('updates the control values from the inputs', () => {
    input('.username').value = 'changed';
    input('.username').dispatchEvent(new Event('input'));
    input('.zip').value = '99999';
    input('.zip').dispatchEvent(new Event('input'));

    expect(host.username.value).toBe('changed');
    expect(host.form.value).toEqual({ username: 'changed', address: { zip: '99999' } });
  });

  it('updates the inputs from the control values', async () => {
    host.username.setValue('programmatic');
    await fixture.whenStable();

    expect(input('.username').value).toBe('programmatic');
  });

  it('resolves the control of the control name directive', () => {
    const directive = fixture.debugElement.query(By.css('.username')).injector.get(FormControlNameDirective);

    expect(directive.control).toBe(host.username);
    expect(directive.path).toEqual([ 'username' ]);
  });

  it('resolves the control of the nested control name directive', () => {
    const directive = fixture.debugElement.query(By.css('.zip')).injector.get(FormControlNameDirective);

    expect(directive.control).toBe(host.zip);
    expect(directive.path).toEqual([ 'address', 'zip' ]);
  });

  it('resolves the form group of the group name directive', () => {
    const directive = fixture.debugElement.query(By.directive(FormGroupNameDirective)).injector.get(FormGroupNameDirective);

    expect(directive.control).toBe(host.address);
    expect(directive.path).toEqual([ 'address' ]);
  });

});
