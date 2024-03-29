import {
  inject,
  Injectable,
  OnDestroy,
} from '@angular/core';
import {
  concat,
  filter,
  from,
  interval,
  map,
  Observable,
  Subject,
  Subscription,
  tap,
} from 'rxjs';
import { MessageMetaData } from './message-meta-data';
import {
  CachedPubSubMessage,
  PubSubMessage,
} from './pub-sub-message';
import {
  RXAP_PUB_SUB_CACHE_SIZE,
  RXAP_PUB_SUB_DISABLE_CACHE,
  RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR,
  RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL,
} from './tokens';

@Injectable({
  providedIn: 'root',
})
export class PubSubService implements OnDestroy {

  /**
   * Main observable to multicast to all observers.
   */
  private readonly messageBus = new Subject<PubSubMessage>();
  private readonly cache: CachedPubSubMessage[] = [];
  private maxCacheSize = inject(RXAP_PUB_SUB_CACHE_SIZE);
  /**
   * Topic message separator.
   */
  private readonly separator = '.';
  private readonly garbageCollectorInterval: number = inject(RXAP_PUB_SUB_GARBAGE_COLLECTOR_INTERVAL);
  private readonly disableCache: boolean = inject(RXAP_PUB_SUB_DISABLE_CACHE);
  private readonly disableGarbageCollector: boolean = inject(RXAP_PUB_SUB_DISABLE_GARBAGE_COLLECTOR);
  private garbageCollectorSubscription: Subscription | null = null;
  private garbageCollectorInitialized = false;

  public get cacheSize(): number {
    return this.cache.length;
  }

  public setMaxCacheSize(size: number) {
    this.maxCacheSize = size;
  }

  public startGarbageCollector() {
    this.garbageCollectorInitialized = true;
    if (this.disableGarbageCollector || this.disableCache) {
      console.warn('Garbage collector is disabled');
      return;
    }
    if (this.garbageCollectorSubscription) {
      this.garbageCollectorSubscription.unsubscribe();
      this.garbageCollectorSubscription = null;
    }
    this.garbageCollectorSubscription = interval(this.garbageCollectorInterval).pipe(
      tap(() => this.runGarbageCollector()),
    ).subscribe();
  }

  public runGarbageCollector() {
    const now = Date.now();
    this.cache.forEach((message, index) => {
      if (message.retention) {
        const diff = now - message.metadata.timestamp;
        if (diff > message.retention) {
          this.cache.splice(index, 1);
        }
      }
    });
  }

  public stopGarbageCollector() {
    this.garbageCollectorSubscription?.unsubscribe();
  }

  ngOnDestroy() {
    this.stopGarbageCollector();
  }

  /**
   * Validates topic matching.
   *
   * @param topic Topic to identify the message/event.
   * @param wildcard Wildcard received from on method.
   *
   * @return true if topic matches, false otherwise.
   */
  public topicMatch(topic: string, wildcard: string): boolean {
    const w = '*';
    const ww = '**';

    const partMatch = (wl: string, k: string): boolean => {
      return wl === w || wl === k;
    };

    const sep = this.separator;
    const kArr = topic.split(sep);
    const wArr = wildcard.split(sep);

    const kLen = kArr.length;
    const wLen = wArr.length;
    const max = Math.max(kLen, wLen);

    for (let i = 0; i < max; i++) {
      const cK = kArr[i];
      const cW = wArr[i];

      if (cW === ww && typeof cK !== 'undefined') {
        return true;
      }

      if (!partMatch(cW, cK)) {
        return false;
      }
    }

    return true;
  }

  /**
   * @param  topic Topic to identify the message.
   * @param  [data] Optional: Additional data sent with the message.
   * @param  [retention] Optional: Retention time in milliseconds.
   * @throws {Error} topic parameter must be a string and must not be empty.
   */
  public publish<T = unknown>(topic: string, data?: T, retention?: number): void {

    if (!this.garbageCollectorInitialized) {
      throw new Error(
        'Garbage collector is not initialized. Ensure the ProvidePubSub function is called in the app config object');
    }

    if (!topic.trim().length) {
      throw new Error('topic parameter must be a string and must not be empty');
    }

    const metadata: MessageMetaData<T> = new MessageMetaData<T>(topic, data);

    this.messageBus.next({ topic, metadata });
    if (!this.disableCache && (
      retention === undefined || retention > 0
    )) {
      if (this.cache.length >= this.maxCacheSize) {
        this.cache.shift();
      }
      this.cache.push({ topic, metadata, retention });
    }
  }

  /**
   * @param topic Topic to identify the message.
   * @param replayCount Number of messages to replay.
   * @return Observable you can subscribe to listen messages.
   */
  public subscribe<T = unknown>(topic: string, replayCount?: number): Observable<MessageMetaData<T>> {

    if (!topic.trim().length) {
      throw new Error('topic parameter must be a string and must not be empty');
    }

    if (!this.garbageCollectorInitialized) {
      throw new Error(
        'Garbage collector is not initialized. Ensure the ProvidePubSub function is called in the app config object');
    }

    const fromCache = replayCount && replayCount > 0 ? this.getFromCache<T>(topic, replayCount ?? 0) : [];

    const fromBus = this.messageBus.asObservable().pipe(
      filter((event: PubSubMessage) => this.topicMatch(event.topic, topic)),
      map((event: PubSubMessage) => event.metadata as MessageMetaData<T>),
    );

    return fromCache.length ? concat(from(fromCache), fromBus) : fromBus;
  }

  /**
   * @param topic Topic to identify the message.
   * @param limit Maximum number of messages to return.
   */
  public getFromCache<T = unknown>(topic: string, limit = 0): Array<MessageMetaData<T>> {

    if (!this.garbageCollectorInitialized) {
      throw new Error(
        'Garbage collector is not initialized. Ensure the ProvidePubSub function is called in the app config object');
    }

    const messages: Array<MessageMetaData<T>> = [];
    for (let i = this.cache.length - 1; i >= 0; i--) {
      const message = this.cache[i];
      if (this.topicMatch(message.topic, topic)) {
        messages.push(message.metadata as MessageMetaData<T>);
        if (limit && messages.length >= limit) {
          break;
        }
      }
    }
    return messages;
  }

}
