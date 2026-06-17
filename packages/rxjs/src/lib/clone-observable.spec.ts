import { Subject } from 'rxjs';
import { CloneObservable } from './clone-observable';

describe('CloneObservable', () => {

  it('should forward next, and mirror the source values', () => {
    const source = new Subject<number>();
    const clone = CloneObservable(source);
    const received: number[] = [];
    clone.subscribe(value => received.push(value));
    source.next(1);
    source.next(2);
    expect(received).toEqual([ 1, 2 ]);
  });

  it('should tear down the source subscription when the clone is unsubscribed', () => {
    const source = new Subject<number>();
    const clone = CloneObservable(source);
    expect(source.observed).toBe(false);
    const subscription = clone.subscribe();
    // the clone subscribed to the source
    expect(source.observed).toBe(true);
    subscription.unsubscribe();
    // unsubscribing the clone must also tear down the inner source subscription
    expect(source.observed).toBe(false);
  });

});
