import {
  Pipe,
  PipeTransform
} from '@angular/core';
import {
  WithIdentifier,
  hasIdentifierProperty,
  getIdentifierProperties,
  clone
} from '@rxap/utilities';

@Pipe({
  name:       'deleteIdentifier',
  standalone: true
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


