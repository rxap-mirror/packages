import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  Input,
  ViewChild,
  OnDestroy,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Required } from '@rxap/utilities';
import { NgModel } from '@angular/forms';
import {
  Subscription,
  BehaviorSubject,
  combineLatest
} from 'rxjs';
import {
  tap,
  map,
  startWith
} from 'rxjs/operators';
import { TextFilterService } from './text-filter.service';

@Component({
  selector:        'rxap-text-filter',
  templateUrl:     './text-filter.component.html',
  styleUrls:       [ './text-filter.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TextFilterComponent<T = any> implements OnInit, OnDestroy, OnChanges {

  @ViewChild('searchInput', { static: true }) public searchInput!: NgModel;

  @Input() @Required public data!: T[];

  public filteredData$ = new BehaviorSubject<T[]>([]);
  public isEmpty$      = new BehaviorSubject<boolean>(false);

  private _subscription = new Subscription();
  private _data         = new BehaviorSubject<T[]>([]);

  constructor(public readonly textFilterService: TextFilterService) {}

  public ngOnChanges(changes: SimpleChanges): void {
    const dataChange = changes.data;
    if (dataChange) {
      this._data.next(dataChange.currentValue);
    }
  }

  public ngOnInit(): void {
    this._data.next(this.data);
    this._subscription.add(
      this.filteredData$.pipe(
        map(data => data.length === 0),
        tap(isEmpty => {
          if (this.isEmpty$.value !== isEmpty) {
            this.isEmpty$.next(isEmpty);
          }
        })
      ).subscribe()
    );
    this._subscription.add(
      combineLatest(
        this.searchInput.valueChanges!.pipe(startWith(null)),
        this._data
      ).pipe(
        tap(([ value, data ]) => this.filteredData$.next(this.textFilterService.getFilteredData(data, value)))
      ).subscribe()
    );
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
