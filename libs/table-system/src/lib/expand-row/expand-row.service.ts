import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * @deprecated use from @rxap/material-table-system
 */
@Injectable()
export class ExpandRowService<Data extends Record<string, any>> {
  public expandedRow = new BehaviorSubject<Data | null>(null);

  public toggleRow(row: Data): void {
    if (this.expandedRow.value === row) {
      this.expandedRow.next(null);
    } else {
      this.expandedRow.next(row);
    }
  }

  public isExpanded(row: Data) {
    return this.expandedRow.value === row;
  }

  public isExpanded$(row: Data): Observable<boolean> {
    return this.expandedRow.pipe(map((expandedRow) => expandedRow === row));
  }
}
