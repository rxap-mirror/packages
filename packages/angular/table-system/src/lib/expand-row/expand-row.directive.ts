import { Directive, HostListener, input, inject } from '@angular/core';
import { ExpandRowService } from './expand-row.service';
import { Required } from '@rxap/utilities';

@Directive({
  selector: 'tr[rxapExpandRow]',
  standalone: true,
})
export class ExpandRowDirective<Data extends Record<string, any>> {
  private readonly expandCell = inject<ExpandRowService<Data>>(ExpandRowService);


  @HostListener('expanded-row')
  public get isExpanded() {
    return this.expandCell.isExpanded(this.element());
  }

  public readonly element = input.required<Data>({ alias: "rxapExpandRow" });

  @HostListener('click')
  public onClick() {
    this.expandCell.toggleRow(this.element());
  }

}
