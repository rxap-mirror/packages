import type {
  QueryList,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  Component,
  ChangeDetectionStrategy,
  Input,
  ContentChildren,
  AfterContentInit,
  isDevMode,
  OnDestroy,
  Renderer2
} from '@angular/core';
import { MatOption } from '@angular/material/core';
import { Subscription } from 'rxjs';
import {
  tap,
  startWith
} from 'rxjs/operators';

@Component({
  selector:        'td[rxap-options-cell]',
  templateUrl:     './options-cell.component.html',
  styleUrls:       [ './options-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: 'rxap-options-cell' },
  standalone:      true
})
export class OptionsCellComponent implements AfterContentInit, OnDestroy, OnChanges {
  @Input('rxap-options-cell')
  public value: any;

  @Input('default')
  public defaultViewValue!: string;

  @Input('empty')
  public emptyViewValue!: string;

  public viewValue!: string;

  private readonly _subscription = new Subscription();

  private _initialised = false;

  constructor(private readonly renderer: Renderer2) {
    this.defaultViewValue = ''; // $localize`:@@rxap-material.table-system.options-cell.unknown:unknown`;
    this.emptyViewValue   = ''; // $localize`:@@rxap-material.table-system.options-cell.empty:empty`;
  }

  @ContentChildren(MatOption, { descendants: true })
  public options!: QueryList<MatOption>;

  public ngAfterContentInit() {
    // Hide the mat-option elements
    this._subscription.add(this.options.changes.pipe(
      startWith(null),
      tap(() => this.options.forEach(option => this.renderer.setStyle(option._getHostElement(), 'display', 'none')))
    ).subscribe());
    this.setViewValue();
    this._initialised = true;
  }

  public setViewValue() {
    if (this.value === undefined || this.value === null) {
      this.viewValue = this.emptyViewValue;
    } else {
      if (this.options) {
        this._subscription.add(this.options.changes
                                   .pipe(
                                     startWith(null),
                                     tap(() => (this.viewValue = this.getViewValue()))
                                   )
                                   .subscribe());
      } else if (isDevMode()) {
        console.log('Could not load any option');
      }
    }
  }

  public ngOnChanges(changes: SimpleChanges) {
    if (this._initialised) {
      if (changes['value']) {
        this.setViewValue();
      }
    }
  }

  public getViewValue(): string {
    return (
      this.options.find((option) => option.value === this.value)?.viewValue ??
      this.defaultViewValue
    );
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}
