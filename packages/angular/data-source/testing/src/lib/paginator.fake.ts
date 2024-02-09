import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PageEvent } from '@rxap/data-source/pagination';

export class PaginatorFake {

  public page = new Subject<Omit<PageEvent, 'length'>>();

  constructor(
    public pageSize = 0,
    public length = 0,
    public pageIndex = 0,
  ) {
    this.page.pipe(
      tap(page => {
        this.pageSize = page.pageSize;
        this.pageIndex = page.pageIndex;
      }),
    ).subscribe();
  }

  public next(): void {
    this.page.next({
      pageIndex: this.pageIndex + 1,
      pageSize: this.pageSize,
    });
  }

}
