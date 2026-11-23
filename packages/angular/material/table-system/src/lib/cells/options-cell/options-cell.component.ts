import { ChangeDetectionStrategy, Component, computed, contentChildren, effect, inject, input, Renderer2, untracked } from '@angular/core';
import { MatOption } from '@angular/material/core';
import { Showcase } from '@ng-prism/core';

@Showcase<OptionsCellComponent>({
  title: 'Options Cell',
  category: 'Table System',
  description: 'Table cell that shows the label of the projected `mat-option` that matches the cell value.',
  status: 'stable',
  host: { template: '<table><tr><td rxap-options-cell></td></tr></table>' },
  imports: [{ name: 'MatOption', from: '@angular/material/core' }],
  variants: [
    {
      name: 'Matching option',
      inputs: { value: 'b' },
      template: '<mat-option value="a">Alpha</mat-option><mat-option value="b">Beta</mat-option><mat-option value="c">Gamma</mat-option>',
    },
    {
      name: 'Default view value',
      description: 'The default is shown if no option matches the value.',
      inputs: { value: 'unknown', defaultViewValue: 'Unknown option' },
      template: '<mat-option value="a">Alpha</mat-option><mat-option value="b">Beta</mat-option>',
    },
    {
      name: 'Empty view value',
      description: 'The empty view value is shown for a null value.',
      inputs: { value: null, emptyViewValue: 'Not set' },
      template: '<mat-option value="a">Alpha</mat-option><mat-option value="b">Beta</mat-option>',
    },
  ],
})
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-options-cell]',
  templateUrl: './options-cell.component.html',
  styleUrls: [ './options-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OptionsCellComponent {
  private readonly renderer = inject(Renderer2);

  public readonly value = input<any>(undefined, { alias: 'rxap-options-cell' });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly defaultViewValue = input('', { alias: 'default' });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly emptyViewValue = input('', { alias: 'empty' });

  public readonly options = contentChildren(MatOption, { descendants: true });

  public readonly viewValue = computed(() => {
    const value = this.value();
    if (value === undefined || value === null) {
      return this.emptyViewValue();
    }
    return this.options().find((option) => option.value === value)?.viewValue ?? this.defaultViewValue();
  });

  constructor() {
    // Hide the mat-option elements
    effect(() => {
      const options = this.options();
      untracked(() => options.forEach(option => this.renderer.setStyle(option._getHostElement(), 'display', 'none')));
    });
  }

  public getViewValue(): string {
    return this.viewValue();
  }
}
