import {
  SubscriptionHandler,
  SubscriptionHandlerError
} from './subscription-handler';
import {
  EMPTY,
  interval
} from 'rxjs';

describe('SubscriptionHandler', () => {

  let sh: SubscriptionHandler;
  const key1 = 'key1';
  const key2 = 'key2';
  const key3 = 'key3';

  beforeEach(() => {
    sh = new SubscriptionHandler();
    sh.add(key1, EMPTY.subscribe());
    sh.add(key2, EMPTY.subscribe());
    sh.add(key2, EMPTY.subscribe());
    sh.add(key3, EMPTY.subscribe());
    sh.add(key3, EMPTY.subscribe());
    sh.add(key3, EMPTY.subscribe());
  });

  it('add subscription without key', () => {

    sh.add(EMPTY.subscribe());

    expect(Array.from(sh.subscriptions.keys())).toContain(SubscriptionHandler.DEFAULT_KEY);

    expect(sh.subscriptions.size).toBe(4);

  });

  it('add subscription with key', () => {

    const key = 'test-key';

    sh.add(key, EMPTY.subscribe());

    expect(Array.from(sh.subscriptions.keys())).toContain(key);

    expect(sh.subscriptions.size).toBe(4);

  });

  it('unsubscribe subscription without key', () => {

    sh.add(EMPTY.subscribe());

    sh.unsubscribe();

    expect(sh.subscriptions.get(SubscriptionHandler.DEFAULT_KEY).closed).toBeTruthy();

    expect(sh.subscriptions.get(key1).closed).toBeFalsy();
    expect(sh.subscriptions.get(key2).closed).toBeFalsy();
    expect(sh.subscriptions.get(key3).closed).toBeFalsy();

  });

  it('unsubscribe subscription with key', () => {

    const key = 'test-key';

    sh.add(key, EMPTY.subscribe());

    sh.unsubscribe(key);

    expect(sh.subscriptions.get(key).closed).toBeTruthy();

    expect(sh.subscriptions.get(key1).closed).toBeFalsy();
    expect(sh.subscriptions.get(key2).closed).toBeFalsy();
    expect(sh.subscriptions.get(key3).closed).toBeFalsy();

  });

  it('unsubscribe all', () => {

    sh.unsubscribeAll();

    expect(sh.subscriptions.get(key1).closed).toBeTruthy();
    expect(sh.subscriptions.get(key2).closed).toBeTruthy();
    expect(sh.subscriptions.get(key3).closed).toBeTruthy();

  });

  it('reset subscription without key', () => {

    sh.add(EMPTY.subscribe());

    const unsubscribeSpy = spyOn(sh, 'unsubscribe');

    sh.reset();

    expect(unsubscribeSpy.calls.count()).toBe(1);

    expect(unsubscribeSpy.calls.mostRecent().args[0]).toBe(SubscriptionHandler.DEFAULT_KEY);

    const s = sh.subscriptions.get(SubscriptionHandler.DEFAULT_KEY);

    expect(s.closed).toBeFalsy();

  });

  it('reset subscription with key', () => {

    const key = 'test-key';

    sh.add(key, EMPTY.subscribe());

    const unsubscribeSpy = spyOn(sh, 'unsubscribe');

    sh.reset(key);

    expect(unsubscribeSpy.calls.count()).toBe(1);

    expect(unsubscribeSpy.calls.mostRecent().args[0]).toBe(key);

    const s = sh.subscriptions.get(key);

    expect(s.closed).toBeFalsy();

  });

  it('reset all', () => {

    const unsubscribeSpy = spyOn(sh, 'unsubscribe');

    sh.resetAll();

    expect(unsubscribeSpy.calls.count()).toBe(3);
    expect(unsubscribeSpy.calls.argsFor(0)[0]).toBe(key1);
    expect(unsubscribeSpy.calls.argsFor(1)[0]).toBe(key2);
    expect(unsubscribeSpy.calls.argsFor(2)[0]).toBe(key3);

    expect(sh.subscriptions.get(key1).closed).toBeFalsy();
    expect(sh.subscriptions.get(key2).closed).toBeFalsy();
    expect(sh.subscriptions.get(key3).closed).toBeFalsy();

  });

  it('throw if unsubscribe is called with undefined subscription group', () => {

    expect(() => sh.unsubscribe('test')).toThrow(SubscriptionHandlerError);

  });

  it('throw if add a new teardown to closed subscription group', () => {

    sh.unsubscribe(key1);

    expect(() => sh.add(key1, EMPTY.subscribe())).toThrow(SubscriptionHandlerError);

  });

});
