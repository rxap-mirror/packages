import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ToDisplayFunction } from '@rxap/utilities';
import { JsonPipe } from '@angular/common';

@Pipe({
  name: 'toDisplay',
  standalone: true,
})
export class ToDisplayPipe implements PipeTransform {

  private jsonPipe = new JsonPipe();

  public transform(value: any, toDisplay: ToDisplayFunction = this.jsonPipe.transform): string {
    return toDisplay(value);
  }

}


