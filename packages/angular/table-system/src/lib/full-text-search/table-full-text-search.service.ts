import {Injectable} from '@angular/core';
import {FilterLike} from '@rxap/data-source/table';
import {BehaviorSubject} from 'rxjs';

@Injectable()
export class TableFullTextSearchService implements FilterLike {
  change = new BehaviorSubject<string>('');

  get current(): string {
    return this.change.value;
  }
}
