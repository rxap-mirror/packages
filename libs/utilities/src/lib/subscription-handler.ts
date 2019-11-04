import {
  Subscription,
  TeardownLogic
} from 'rxjs';

export enum SubscriptionHandlerErrorTypes {
  NOT_FOUND = 'Subscription with specified key not found',
  CLOSED = 'Subscription with specified key is closed',
}

export class SubscriptionHandlerError extends Error {
  constructor(public type: SubscriptionHandlerErrorTypes, public key: string) {
    super(type + ` [${key}]`);

    Object.setPrototypeOf(this, SubscriptionHandlerError.prototype);
  }
}

/**
 * Provide the same functionality as Subscription from rxjs.
 * With the extation that the subscriptions can be group added/unsubscribed
 */
export class SubscriptionHandler {

  /**
   * @internal
   */
  public static DEFAULT_KEY = '__rxap_subscription_handler__';

  /**
   * A map of subscriptions
   *
   * @internal
   */
  public readonly subscriptions = new Map<string, Subscription>();

  /**
   * Adds a tear down to be called during the unsubscribe() of this
   * Subscription. Can also be used to add a child subscription.
   *
   * If the tear down being added is a subscription that is already
   * unsubscribed, is the same reference `add` is being called on, or is
   * `Subscription.EMPTY`, it will not be added.
   *
   * If this subscription is already in an `closed` state, the passed
   * tear down logic will be executed immediately.
   *
   * When a parent subscription is unsubscribed, any child subscriptions that were added to it are also unsubscribed.
   *
   * @param {TeardownLogic} teardown The additional logic to execute on
   * teardown.
   * @return {Subscription} Returns the Subscription used or created to be
   * added to the inner subscriptions list. This Subscription can be used with
   * `remove()` to remove the passed teardown logic from the inner subscriptions
   * list.
   */
  public add(teardown: TeardownLogic): Subscription;
  /**
   * Adds a tear down to be called during the unsubscribe() of this
   * Subscription. Can also be used to add a child subscription.
   *
   * If the tear down being added is a subscription that is already
   * unsubscribed, is the same reference `add` is being called on, or is
   * `Subscription.EMPTY`, it will not be added.
   *
   * If this subscription is already in an `closed` state, the passed
   * tear down logic will be executed immediately.
   *
   * When a parent subscription is unsubscribed, any child subscriptions that were added to it are also unsubscribed.
   *
   * @param key the subscription group key
   * @param {TeardownLogic} teardown The additional logic to execute on
   * teardown.
   * @return {Subscription} Returns the Subscription used or created to be
   * added to the inner subscriptions list. This Subscription can be used with
   * `remove()` to remove the passed teardown logic from the inner subscriptions
   * list.
   */
  public add(key: string, teardown: TeardownLogic): Subscription;
  public add(keyOrTeardown: string | TeardownLogic, teardown?: TeardownLogic): Subscription {
    const key = typeof keyOrTeardown === 'string' ? keyOrTeardown : SubscriptionHandler.DEFAULT_KEY;
    if (!this.subscriptions.has(key)) {
      this.subscriptions.set(key, new Subscription());
    }
    // tslint:disable-next-line:no-non-null-assertion
    const subscription = this.subscriptions.get(key)!;
    if (subscription.closed) {
      throw new SubscriptionHandlerError(SubscriptionHandlerErrorTypes.CLOSED, key);
    }

    return subscription.add(teardown);
  }

  public has(key: string): boolean {
    return this.subscriptions.has(key);
  }

  /**
   * Disposes the resources held by the subscription. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Subscription was created.
   *
   * @param key (optional) the target group of subscriptions
   */
  public unsubscribe(key?: string): void {
    key = key || SubscriptionHandler.DEFAULT_KEY;
    const subscription = this.subscriptions.get(key);
    if (subscription) {
      subscription.unsubscribe();
    } else {
      throw new SubscriptionHandlerError(
        SubscriptionHandlerErrorTypes.NOT_FOUND,
        key,
      )
    }
  }

  /**
   * Disposes all the resources held by the subscription handler. May, for instance, cancel
   * an ongoing Observable execution or cancel any other type of work that
   * started when the Subscription was created.
   */
  public unsubscribeAll(): void {
    Array.from(this.subscriptions.keys()).forEach(key => this.unsubscribe(key));
  }

  /**
   * Resets the specified subscription group.
   * Each Subscription in the group will be unsubscribed before the new subscription
   * instance is created
   *
   * @param key (optional) the target group of subscriptions
   */
  public reset(key?: string): void {
    key = key || SubscriptionHandler.DEFAULT_KEY;
    this.unsubscribe(key);
    this.subscriptions.set(key, new Subscription());
  }

  public resetAll(): void {
    Array.from(this.subscriptions.keys()).forEach(key => this.reset(key));
  }

}
