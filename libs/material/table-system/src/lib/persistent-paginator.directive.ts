import {
  Directive,
  NgModule,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';

@Directive({
  selector: 'mat-paginator[rxapPersistent]'
})
export class PersistentPaginatorDirective implements OnInit, OnDestroy {

  @Input()
  public id?: string;

  private _subscription?: Subscription;

  constructor(
    private readonly matPaginator: MatPaginator,
  ) {}

  public ngOnInit() {
    const config = this.restoreConfig();
    if (config) {
      this.matPaginator.pageSize = config.pageSize;
    }
    this._subscription = this.matPaginator.page.pipe(
      tap(() => this.storeConfig())
    ).subscribe()
  }

  public ngOnDestroy() {
    this._subscription?.unsubscribe();
  }

  public getKey() {
    return 'rxap_mat-paginator-persistent' + this.id;
  }

  public storeConfig() {
    const pageSize = this.matPaginator.pageSize;
    localStorage.setItem(this.getKey(), JSON.stringify({ pageSize }));
  }

  public restoreConfig(): { pageSize: number } | null {
    const configStorage = localStorage.getItem(this.getKey());
    if (configStorage) {
      try {
        return JSON.parse(configStorage);
      } catch (e: any) {
        console.warn(`Could not parse mat paginator persistent config: ${e.message}`);
      }
    }
    return null;
  }

}

@NgModule({
  exports: [ PersistentPaginatorDirective ],
  declarations: [ PersistentPaginatorDirective ]
})
export class PersistentPaginatorDirectiveModule {}
