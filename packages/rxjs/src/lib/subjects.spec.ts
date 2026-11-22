import { CounterSubject } from './counter.subject';
import { RequestInProgressSubject } from './request-in-progress.subject';
import { ButtonTypes } from './button.definition';

describe('CounterSubject', () => {
  it('starts at the given value', () => {
    expect(new CounterSubject().value).toBe(0);
    expect(new CounterSubject(5).value).toBe(5);
  });

  it('increases by the given amount', () => {
    const c = new CounterSubject();
    c.increase();
    c.increase(4);
    expect(c.value).toBe(5);
  });

  it('decreases but does not go below zero by default', () => {
    const c = new CounterSubject(3);
    c.decrease();
    expect(c.value).toBe(2);
    c.decrease(10);
    expect(c.value).toBe(0);
    c.decrease();
    expect(c.value).toBe(0);
  });

  it('can go negative when allowed', () => {
    const c = new CounterSubject(0, true);
    c.decrease(2);
    expect(c.value).toBe(-2);
  });
});

describe('RequestInProgressSubject', () => {
  it('is loading while the counter is positive', () => {
    const r = new RequestInProgressSubject();
    const seen: boolean[] = [];
    r.loading$().subscribe((v) => seen.push(v));
    r.increase();
    r.decrease();
    expect(seen).toEqual([false, true, false]);
  });
});

describe('ButtonTypes', () => {
  it('keeps the deprecated enum values', () => {
    expect(ButtonTypes.MiniFab).toBe('mini-fab');
  });
});
