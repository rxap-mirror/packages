import { BehaviorSubject, lastValueFrom, of, toArray } from 'rxjs';
import { isDeepEqual, isNotDeepEqual } from './is-deep-equal';
import { isDefined } from './is-defined';
import { isEqual } from './is-equal';
import { log } from './log';
import { throwIfEmpty } from './throw-if-empty';
import { toBoolean } from './to-boolean';

const collect = <T>(source: any) => lastValueFrom<T[]>(source.pipe(toArray()));

describe('operators', () => {
  it('isDeepEqual keeps deeply equal values', async () => {
    const result = await collect(of({ a: 1 }, { a: 2 }, { a: 1 }).pipe(isDeepEqual({ a: 1 })));
    expect(result).toEqual([{ a: 1 }, { a: 1 }]);
  });

  it('isNotDeepEqual drops deeply equal values and supports functions with context', async () => {
    expect(await collect(of({ id: 1 }, { id: 2 }).pipe(isNotDeepEqual({ id: 1 })))).toEqual([{ id: 2 }]);
    const context = { id: 1 };
    const compare = function (this: any) {
      return this.id;
    };
    expect(await collect(of(1, 2).pipe(isNotDeepEqual<number, any>(compare, context)))).toEqual([2]);
  });

  it('isEqual uses strict equality', async () => {
    expect(await collect(of(1, '1', 1, 2).pipe(isEqual<any>(1)))).toEqual([1, 1]);
    const obj = {};
    expect(await collect(of(obj, {}).pipe(isEqual(obj)))).toEqual([obj]);
  });

  it('isDefined drops null and undefined but keeps falsy values', async () => {
    expect(await collect(of(1, null, 0, undefined, '', false).pipe(isDefined()))).toEqual([1, 0, '', false]);
  });

  it('isDefined forwards errors and completion', async () => {
    const error = new Error('x');
    const subject = new BehaviorSubject<number | null>(1);
    const values: any[] = [];
    let err: any;
    subject.pipe(isDefined()).subscribe({ next: (v) => values.push(v), error: (e) => (err = e) });
    subject.next(null);
    subject.next(2);
    subject.error(error);
    expect(values).toEqual([1, 2]);
    expect(err).toBe(error);
  });

  it('throwIfEmpty errors for null, undefined and empty strings', async () => {
    for (const empty of [null, undefined, '']) {
      await expect(collect(of(empty).pipe(throwIfEmpty('empty!')))).rejects.toThrow('empty!');
    }
  });

  it('throwIfEmpty passes values including falsy non-empty ones', async () => {
    expect(await collect(of(1, 'a', 0, false).pipe(throwIfEmpty('empty!')))).toEqual([1, 'a', 0, false]);
  });

  it('toBoolean converts values', async () => {
    expect(await collect(of('false', 'true', 0, 1, '', 'x', null).pipe(toBoolean()))).toEqual([
      false, true, false, true, false, true, false,
    ]);
  });

  it('log writes the transformed value and passes the original through', async () => {
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    expect(await collect(of(1, 2).pipe(log<number>('msg', (v) => v * 2)))).toEqual([1, 2]);
    expect(spy.mock.calls).toEqual([['msg', 2], ['msg', 4]]);
    await collect(of(5).pipe(log<number>()));
    expect(spy).toHaveBeenLastCalledWith(undefined, 5);
    spy.mockRestore();
  });
});
