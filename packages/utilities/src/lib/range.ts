export class RangeIterator implements Iterator<number> {

  public position = 0;

  constructor(public range: Range, public reverse: boolean) {
  }

  public next(): IteratorResult<number> {
    const value = this.reverse ? this.range.end - this.position : this.range.start + this.position;
    this.position++;
    const done = this.reverse ? this.range.start === value + 1 : this.range.end === value - 1;
    return {
      value,
      done,
    };
  }

}

export class Range {

  constructor(
    public start: number,
    public end: number,
  ) {
    if (this.start > this.end) {
      throw new Error(`The range start '${this.start}' must be less then the range end '${this.end}'!`);
    }
  }

  public static Create(start: number, end: number): Range {
    return new Range(start, end);
  }

  public [Symbol.iterator](): Iterator<number> {
    return new RangeIterator(this, false);
  }

  public reverse(): Iterable<number> {
    return {
      [Symbol.iterator]: () => new RangeIterator(this, true),
    };
  }

  public toArray(): number[] {
    return Array.from(this);
  }

}
