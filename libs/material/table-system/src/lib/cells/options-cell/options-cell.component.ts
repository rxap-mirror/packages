import {
  Component,
  ChangeDetectionStrategy, Input, ContentChildren, QueryList, AfterContentInit, isDevMode, OnDestroy,
} from '@angular/core';
import { MatOption } from '@angular/material/core';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector:        'td[rxap-options-cell]',
  templateUrl:     './options-cell.component.html',
  styleUrls:       [ './options-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'mfd-options-cell' }
})
export class OptionsCellComponent implements AfterContentInit, OnDestroy {

  @Input('rxap-options-cell')
  public value: any;

  @Input('default')
  public defaultViewValue!: string;

  @Input('empty')
  public emptyViewValue!: string;

  public viewValue: string;

  private _subscription?: Subscription;

  constructor() {
    this.defaultViewValue = $localize`:@@rxap-material.table-system.options-cell.unknown:unknown`;
    this.emptyViewValue = $localize`:@@rxap-material.table-system.options-cell.empty:empty`;
  }

  @ContentChildren(MatOption, {descendants: true})
  public options: QueryList<MatOption>;

  public ngAfterContentInit() {
    if (this.value === undefined || this.value === null) {
      this.viewValue = this.emptyViewValue;
    } else {
      if (this.options) {
        this.viewValue = this.getViewValue();
        this._subscription = this.options.changes.pipe(
          tap(() => this.viewValue = this.getViewValue())
        ).subscribe();
      } else if (isDevMode()) {
        console.log('Could not load any option');
      }
    }
  }

  public getViewValue(): string {
    return this.options.find(option => option.value === this.value)?.viewValue ?? this.defaultViewValue;
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

}
