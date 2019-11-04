import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TextFilterService<T = any> {

  public getFilteredData(data: T[], filterValue: string): T[] {
    if (filterValue === '' || filterValue === null || filterValue === undefined) {
      return data.slice();
    }
    return data.filter(item => this.compare(filterValue.toLowerCase(), item));
  }

  public compare(filterValue: string, item: T): boolean {
    if (item === null || item === undefined) {
      return false;
    }
    if (typeof item === 'object') {
      function objToString(obj: any): string {
        if (obj === null || item === undefined) {
          return '';
        }
        return Object.values(obj).map(prop => typeof prop === 'object' ? objToString(prop) : prop + '').join('◬');
      }

      return objToString(item).toLowerCase().includes(filterValue);
    } else {
      return (item + '').toLowerCase().includes(filterValue);
    }
  }

}
