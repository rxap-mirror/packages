import { WithChildren } from '../helpers';

export function flatten<T>(array: Array<WithChildren<T>>): T[] {
  return array.reduce((acc, item) => {
    if (item.children) {
      acc.push(item, ...flatten(item.children ?? []));
    } else {
      acc.push(item);
    }
    return acc;
  }, [] as T[]);
}
