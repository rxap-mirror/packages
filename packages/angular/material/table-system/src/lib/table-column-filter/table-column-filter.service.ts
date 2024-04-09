import { Injectable } from '@angular/core';
import { FilterLike } from '@rxap/data-source/table';
import { clone } from '@rxap/utilities';
import { BehaviorSubject } from 'rxjs';

// TODO : move to rxap packages
@Injectable()
export class TableColumnFilterService implements FilterLike {
  public readonly change = new BehaviorSubject<Record<string, string>>({});
  public get current(): Record<string, string> {
    return clone(this.change.value);
  }

  public setFilter(column: string, value: string | undefined | null): void {
    const next = this.current;
    if (value) {
      next[column] = value;
    } else if (next[column]) {
      delete next[column];
    }
    this.change.next(next);
  }

}
