import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormControlName, ReactiveFormsModule } from '@angular/forms';
import { RxapFormControl } from '../form-control';
import { RxapFormGroup } from '../form-group';
import { ParentControlContainerDirective } from './parent-control-container.directive';

@Component({
  standalone: true,
  imports: [ ReactiveFormsModule, ParentControlContainerDirective ],
  template: `
    <form [formGroup]="form">
      <input formControlName="name" parentControlContainer />
    </form>`,
})
class ParentControlContainerHost {
  readonly form = new RxapFormGroup<any>({ name: new RxapFormControl<string>('n', { controlId: 'name' }) }, { controlId: 'root' });
}

describe('ParentControlContainerDirective', () => {

  it('matches an element with a formControlName and keeps the control resolvable', async () => {
    TestBed.configureTestingModule({ imports: [ ParentControlContainerHost ] });
    const fixture = TestBed.createComponent(ParentControlContainerHost);
    await fixture.whenStable();

    const element = fixture.debugElement.query(By.directive(ParentControlContainerDirective));
    expect(element).toBeTruthy();
    expect(element.injector.get(FormControlName).control).toBe(fixture.componentInstance.form.get('name'));
    expect((element.nativeElement as HTMLInputElement).value).toBe('n');
  });

});
