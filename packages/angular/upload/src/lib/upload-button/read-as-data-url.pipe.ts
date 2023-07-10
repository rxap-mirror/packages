import {
  Pipe,
  PipeTransform,
} from '@angular/core';
import { fromEvent } from 'rxjs';
import {
  map,
  take,
} from 'rxjs/operators';

@Pipe({
  name: 'readAsDataURL',
  standalone: true,
})
export class ReadAsDataURLPipe implements PipeTransform {

  public async transform(file: File | Blob | null): Promise<string | null> {

    if (!file) {
      return null;
    }

    const reader = new FileReader();

    const dataUrl$ = fromEvent<any>(reader, 'load').pipe(
      map(event => event.target.result),
      take(1),
    );

    reader.readAsDataURL(file);

    return dataUrl$.toPromise();
  }

}


