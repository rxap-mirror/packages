import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ContentChildren,
  QueryList
} from '@angular/core';
import { DataGridRowDefDirective } from '../data-grid-row-def.directive';
import { Required } from '@rxap/utilities';
import { GetFromObjectPipe } from '@rxap/pipes';
import {
  NgIf,
  NgFor,
  NgTemplateOutlet
} from '@angular/common';

@Component({
  // tslint:disable-next-line:component-selector
  selector:        'rxap-data-grid-readonly',
  templateUrl:     './data-grid-readonly.component.html',
  styleUrls:       [ './data-grid-readonly.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-data-grid-readonly' },
  standalone:      true,
  imports:         [ NgIf, NgFor, NgTemplateOutlet, GetFromObjectPipe ]
})
export class DataGridReadonlyComponent<T extends Record<string, any>> {

  @Input()
  public header: boolean = true;

  @Input()
  @Required
  public data!: object;

  @ContentChildren(DataGridRowDefDirective)
  @Required
  public rows!: QueryList<DataGridRowDefDirective<T>>;
}
