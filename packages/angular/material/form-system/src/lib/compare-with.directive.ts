import { Directive, isDevMode, OnInit, input, inject } from '@angular/core';
import { MatSelect } from '@angular/material/select';
import {
  equals,
  getFromObject,
} from '@rxap/utilities';
import { Showcase } from '@ng-prism/core';

const PRISM_FORM_STYLE = 'display: flex; flex-direction: column; gap: 8px; min-width: 280px';

@Showcase<CompareWithDirective>({
  title: 'Compare With',
  category: 'Material Form System',
  description: 'Compares the options of a select by the value of an object path instead of the object reference. The value of the control is a different object than the option, but the matching option is selected.',
  status: 'stable',
  imports: [
    { name: 'ReactiveFormsModule', from: '@angular/forms' },
    { name: 'FormDirective', from: '@rxap/forms' },
    { name: 'MatFormFieldModule', from: '@angular/material/form-field' },
    { name: 'MatInputModule', from: '@angular/material/input' },
    { name: 'MatSelectModule', from: '@angular/material/select' },
  ],
  variants: [
    {
      name: 'By id',
      host: { template: `<form rxapForm style="${ PRISM_FORM_STYLE }"><mat-form-field><mat-label>Role</mat-label><mat-select formControlName="role" rxapCompareWith="id"><mat-option [value]="{ id: 1, label: 'Administrator' }">Administrator</mat-option><mat-option [value]="{ id: 2, label: 'Editor' }">Editor</mat-option></mat-select></mat-form-field></form>` },
    },
    {
      name: 'By label',
      host: { template: `<form rxapForm style="${ PRISM_FORM_STYLE }"><mat-form-field><mat-label>Role</mat-label><mat-select formControlName="role" rxapCompareWith="label"><mat-option [value]="{ id: 1, label: 'Administrator' }">Administrator</mat-option><mat-option [value]="{ id: 2, label: 'Editor' }">Editor</mat-option></mat-select></mat-form-field></form>` },
    },
  ],
})
@Directive({
  selector: 'mat-select[rxapCompareWith]',
  standalone: true,
})
export class CompareWithDirective implements OnInit {
  private readonly matSelect = inject<MatSelect>(MatSelect);

  public readonly objectPath = input.required<string>({ alias: "rxapCompareWith" });

  public ngOnInit() {
    this.matSelect.compareWith = this.compareWith.bind(this);
  }

  private compareWith(o1: any, o2: any): boolean {
    const objectPath = this.objectPath();
    if (objectPath) {
      if (typeof o1 !== 'object' || typeof o2 !== 'object') {
        if (isDevMode()) {
          console.warn(
            'At least one of the select options value is not an object',
          );
        }
        return false;
      }
      if (o1 === null || o1 === undefined || o2 === null || o2 === undefined) {
        if (isDevMode()) {
          console.warn(
            'At least one of the select options value is undefined or null',
          );
        }
        return false;
      }
      const o1Value = getFromObject(o1, objectPath);
      const o2Value = getFromObject(o2, objectPath);
      if (o1Value === undefined || o2Value === undefined) {
        return false;
      }
      return o1Value === o2Value;
    } else {
      return equals(o1, o2);
    }
  }
}


