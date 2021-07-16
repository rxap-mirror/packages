import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import { fromEvent } from 'rxjs';
import {
  take,
  map
} from 'rxjs/operators';
import { log } from '@rxap/utilities/rxjs';

@Pipe({
  name: 'readAsDataURL'
})
export class ReadAsDataURLPipe implements PipeTransform {

  public async transform(file: File | Blob | null): Promise<string | null> {

    if (!file) {
      return null;
    }

    const reader = new FileReader();

    const dataUrl$ = fromEvent<any>(reader, 'load').pipe(
      log(),
      map(event => event.target.result),
      take(1)
    );

    reader.readAsDataURL(file);

    return dataUrl$.toPromise();
  }

}

@NgModule({
  declarations: [ ReadAsDataURLPipe ],
  exports:      [ ReadAsDataURLPipe ]
})
export class ReadAsDataURLPipeModule {}
