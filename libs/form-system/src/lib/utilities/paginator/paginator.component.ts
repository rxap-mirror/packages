import {
  Component,
  OnInit,
  Input,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  Observable,
  BehaviorSubject,
  combineLatest,
  Subscription
} from 'rxjs';
import { Required } from '@rxap/utilities';
import {
  map,
  tap,
  startWith
} from 'rxjs/operators';
import {
  MatPaginator,
  PageEvent
} from '@angular/material';

@Component({
  selector:    'rxap-paginator',
  templateUrl: './paginator.component.html',
  styleUrls:   [ './paginator.component.scss' ]
})
export class PaginatorComponent<T> implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) public paginator!: MatPaginator;

  @Input() @Required public data!: T[] | BehaviorSubject<T[]>;

  public length$!: Observable<number>;

  public pagedData$ = new BehaviorSubject<T[]>([]);

  private _subscription = new Subscription();

  public ngOnInit() {
    if (!(this.data instanceof BehaviorSubject)) {
      this.data = new BehaviorSubject(this.data);
    }
    this.length$ = this.data.pipe(map(data => data.length));
    this._subscription.add(
      combineLatest([
        this.data,
        this.paginator.page.pipe(
          startWith({
            pageIndex: 0,
            pageSize:  5,
            length:    0
          } as PageEvent)
        )
      ]).pipe(
        map(([ data, pageEvent ]) => {
          const startIndex = pageEvent.pageIndex * pageEvent.pageSize;
          return data.slice(startIndex, startIndex + pageEvent.pageSize);
        }),
        tap(pagedData => this.pagedData$.next(pagedData))
      ).subscribe()
    );
  }

  public ngOnDestroy(): void {
    this._subscription.unsubscribe();
  }

}
