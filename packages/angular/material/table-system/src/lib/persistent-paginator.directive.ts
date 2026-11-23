import { DestroyRef, Directive, OnInit, input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { tap } from 'rxjs/operators';
import { Showcase } from '@ng-prism/core';

@Showcase<PersistentPaginatorDirective>({
  title: 'Persistent Paginator',
  category: 'Table System',
  description: 'Stores the page size of a `mat-paginator` in the local storage and restores it, identified by the id input.',
  status: 'stable',
  imports: [{ name: 'MatPaginator', from: '@angular/material/paginator' }],
  host: { template: '<mat-paginator rxapPersistent [length]="100" [pageSize]="10" [pageSizeOptions]="[5, 10, 25, 50]"></mat-paginator>' },
  variants: [
    { name: 'Default', inputs: { id: 'prism-table' } },
    { name: 'Other table', description: 'The page size is stored per id.', inputs: { id: 'prism-other-table' } },
  ],
})
@Directive({
  selector: 'mat-paginator[rxapPersistent]',
  standalone: true,
})
export class PersistentPaginatorDirective implements OnInit {
  private readonly matPaginator = inject(MatPaginator);


  public readonly id = input<string>();

  private readonly destroyRef = inject(DestroyRef);

  public ngOnInit() {
    const config = this.restoreConfig();
    if (config) {
      this.matPaginator.pageSize = config.pageSize;
    }
    this.matPaginator.page.pipe(
      tap(() => this.storeConfig()),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  public getKey() {
    return 'rxap_mat-paginator-persistent' + this.id();
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
        console.warn(`Could not parse mat paginator persistent config: ${ e.message }`);
      }
    }
    return null;
  }

}


