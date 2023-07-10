import { map } from 'rxjs/operators';

export function toBoolean() {
  return map<any, boolean>(value => value === 'false' ? false : Boolean(value));
}
