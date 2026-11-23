import { Directive, inject } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { hasIndexSignature } from '@rxap/utilities';
import { Showcase } from '@ng-prism/core';

const PRISM_FORM_STYLE = 'display: flex; flex-direction: column; gap: 8px; min-width: 280px';

@Showcase<FormControlMarkDirtyDirective>({
  title: 'Form Control Mark Dirty',
  category: 'Forms',
  description: 'Marks the control of the parent control container, and all its children, as dirty on click.',
  status: 'stable',
  imports: [ { name: 'ReactiveFormsModule', from: '@angular/forms' } ],
  host: {
    template: `<form rxapForm #form="rxapForm" style="${ PRISM_FORM_STYLE }"><label>Name <input formControlName="name" /></label><div style="display: flex; gap: 8px"><button type="button" rxapFormControlMarkDirty>Mark dirty</button><button type="button" rxapFormControlMarkTouched>Mark touched</button><button type="button" rxapFormControlMarkPristine>Mark pristine</button><button type="button" rxapFormControlMarkUntouched>Mark untouched</button></div><small>dirty: {{ form.dirty }}, touched: {{ form.touched }}</small></form>`,
  },
  variants: [
    { name: 'Default' },
  ],
})
@Directive({
  selector: '[rxapFormControlMarkDirty]',
  host: { '(click)': 'onClick()' },
  standalone: true,
})
export class FormControlMarkDirtyDirective {
  private readonly parent = inject(ControlContainer);

  public onClick() {
    const control = this.parent.control;

    if (control && hasIndexSignature(control) && typeof control['markAllAsDirty'] === 'function') {
      control['markAllAsDirty']();
    } else {
      control?.markAsDirty();
    }

  }

}
