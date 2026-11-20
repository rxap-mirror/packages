import {
  Directive,
  HostListener,
  Inject,
  input
} from '@angular/core';
import { ExpandRowService } from './expand-row.service';
import { Required } from '@rxap/utilities';

@Directive({
  selector: 'tr[rxapExpandRow]',
  standalone: true,
})
export class ExpandRowDirective<Data extends Record<string, any>> {

  @HostListener('expanded-row')
  public get isExpanded() {
    return this.expandCell.isExpanded(this.element());
  }

  public readonly element = input.required<Data>();

  constructor(
    @Inject(ExpandRowService)
    private readonly expandCell: ExpandRowService<Data>,
  ) {
  }

  @HostListener('click')
  public onClick() {
    this.expandCell.toggleRow(this.element());
  }

}
