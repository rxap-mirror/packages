import { Directive, input, inject } from '@angular/core';
import { ExpandRowService } from './expand-row.service';

@Directive({
  selector: 'tr[rxapExpandRow]',
  standalone: true,
  host: {
    '[class.expanded-row]': 'isExpanded',
    '(click)': 'onClick()',
  },
})
export class ExpandRowDirective<Data extends Record<string, any>> {
  private readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);


  public get isExpanded() {
    return this.expandCell.isExpanded(this.element());
  }

  public readonly element = input.required<Data>({ alias: "rxapExpandRow" });

  public onClick() {
    this.expandCell.toggleRow(this.element());
  }

}
