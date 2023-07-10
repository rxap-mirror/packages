export function unique<T>() {
  return (value: T, index: number, self: T[]) => self.indexOf(value) === index;
}
