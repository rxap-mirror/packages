import {
  Pipe,
  PipeTransform,
  NgModule
} from '@angular/core';
import {
  WithIdentifier,
  hasIdentifierProperty,
  getIdentifierProperties,
  clone
} from '@rxap/utilities';

@Pipe({
  name: 'deleteIdentifier',
})
export class DeleteIdentifierPipe implements PipeTransform {

  public transform<T>(value: (WithIdentifier & T) | null): T | null {
    if (!value) {
      return value;
    }
    const copy: any = clone(value);
    if (hasIdentifierProperty(copy)) {
      for (const pk of getIdentifierProperties(copy)) {
        delete copy[ pk ];
      }
    }
    return copy;
  }

}

@NgModule({
  exports:      [ DeleteIdentifierPipe ],
  declarations: [ DeleteIdentifierPipe ],
})
export class DeleteIdentifierPipeModule {

}
