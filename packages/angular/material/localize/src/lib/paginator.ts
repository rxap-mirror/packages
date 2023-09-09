import {
  Injectable,
  StaticProvider,
} from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { Subject } from 'rxjs';

declare let $localize: any;

@Injectable()
export class I18nMatPaginatorIntl implements MatPaginatorIntl {

  changes = new Subject<void>();

  /** A label for the page size selector. */
  itemsPerPageLabel: string = $localize`:@@itemsPerPageLabelMatPaginator:Items per page`;

  /** A label for the button that increments the current page. */
  nextPageLabel: string = $localize`:@@nextPageLabelMatPaginator:Next page`;

  /** A label for the button that decrements the current page. */
  previousPageLabel: string = $localize`:@@previousPageLabelMatPaginator:Previous page`;

  /** A label for the button that moves to the first page. */
  firstPageLabel: string = $localize`:@@firstPageLabelMatPaginator:First page`;

  /** A label for the button that moves to the last page. */
  lastPageLabel: string = $localize`:@@lastPageLabelMatPaginator:Last page`;

  /** A label for the range of items within the current page and the length of the whole list. */
  getRangeLabel: (page: number, pageSize: number, length: number) => string = (
    page: number,
    pageSize: number,
    length: number,
  ) => {
    if (length == 0 || pageSize == 0) {
      return $localize`:@@emptyPageRangeLabelMatPaginator:0 of ${ length }`;
    }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    // If the start index exceeds the list length, do not try and fix the end index to the end.
    const endIndex =
      startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

    return $localize`:@@pageRangeLabelMatPaginator:${ startIndex + 1 } – ${ endIndex } of ${ length }`;
  };

}

export const I18N_MAT_PAGINATOR_INTL_PROVIDER: StaticProvider = {
  provide: MatPaginatorIntl,
  useClass: I18nMatPaginatorIntl,
};

export function ProvideI18nMatPaginatorIntl() {
  return I18N_MAT_PAGINATOR_INTL_PROVIDER;
}
