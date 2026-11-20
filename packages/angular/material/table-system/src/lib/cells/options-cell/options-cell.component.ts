import type {
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  isDevMode,
  OnDestroy,
  Renderer2,
  input,
  contentChildren
} from '@angular/core';
import { MatOption } from '@angular/material/core';
import { Subscription } from 'rxjs';
import {
  startWith,
  tap,
} from 'rxjs/operators';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'td[rxap-options-cell]',
  templateUrl: './options-cell.component.html',
  styleUrls: [ './options-cell.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class OptionsCellComponent implements AfterContentInit, OnDestroy, OnChanges {
  public readonly value = input<any>(undefined, { alias: "rxap-options-cell" });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly defaultViewValue = input.required<string>({ alias: "default" });

  // eslint-disable-next-line @angular-eslint/no-input-rename
  public readonly emptyViewValue = input.required<string>({ alias: "empty" });

  public viewValue!: string;

  private readonly _subscription = new Subscription();

  private _initialised = false;

  constructor(private readonly renderer: Renderer2) {
    this.defaultViewValue = ''; // $localize`:@@rxap-material.table-system.options-cell.unknown:unknown`;
    this.emptyViewValue = ''; // $localize`:@@rxap-material.table-system.options-cell.empty:empty`;
  }

  public readonly options = contentChildren(MatOption, { descendants: true });

  public ngAfterContentInit() {
    // Hide the mat-option elements
    this._subscription.add(this.options().changes.pipe(
      startWith(null),
      tap(() => this.options().forEach(option => this.renderer.setStyle(option._getHostElement(), 'display', 'none'))),
    ).subscribe());
    this.setViewValue();
    this._initialised = true;
  }

  public setViewValue() {
    const value = this.value();
    if (value === undefined || value === null) {
      this.viewValue = this.emptyViewValue();
    } else {
      const options = this.options();
      if (options) {
        this._subscription.add(options.changes
                                   .pipe(
                                     startWith(null),
                                     tap(() => (this.viewValue = this.getViewValue())),
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
      this.options().find((option) => option.value === this.value())?.viewValue ??
      this.defaultViewValue()
    );
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }
}
