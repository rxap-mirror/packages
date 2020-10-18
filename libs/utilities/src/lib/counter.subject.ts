import { BehaviorSubject } from 'rxjs';

export class CounterSubject extends BehaviorSubject<number> {

  constructor(counter: number = 0, public readonly allowNegative = false) {
    super(counter);
  }

  increase(count: number = 1) {
    this.next(this.value + count);
  }

  decrease(count: number = 1) {
    if (!this.allowNegative && this.value === 0) {
      return;
    }
    if (!this.allowNegative && this.value - count < 0) {
      this.next(0);
    } else {
      this.next(this.value - count);
    }
  }


}
