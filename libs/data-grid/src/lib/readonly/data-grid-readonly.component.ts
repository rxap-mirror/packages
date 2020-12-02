import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ContentChildren,
  QueryList
} from '@angular/core';
import { DataGridRowDefDirective } from '../data-grid-row-def.directive';
import { Required } from '@rxap/utilities';

@Component({
  // tslint:disable-next-line:component-selector
  selector:        'rxap-data-grid-readonly',
  templateUrl:     './data-grid-readonly.component.html',
  styleUrls:       [ './data-grid-readonly.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-data-grid-readonly' }
})
export class DataGridReadonlyComponent<T extends Record<string, any>> {

  @Input()
  @Required
  public data!: object;

  @ContentChildren(DataGridRowDefDirective)
  @Required
  public rows!: QueryList<DataGridRowDefDirective<T>>;
}
