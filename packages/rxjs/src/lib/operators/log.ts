import {tap} from 'rxjs/operators';

export function log<T>(message?: string, transform: (value: any) => any = value => value) {
  return tap<T>(value => console.log(message, transform(value)));
}
