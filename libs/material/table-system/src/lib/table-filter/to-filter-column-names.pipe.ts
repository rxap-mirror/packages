import {
  PipeTransform,
  Pipe
} from '@angular/core';

@Pipe({
  name:       'toFilterColumnNames',
  standalone: true
})
export class ToFilterColumnNamesPipe implements PipeTransform {

  public transform(columns: string[]): string[] {
    return columns.map(column => 'filter_' + column);
  }

}
