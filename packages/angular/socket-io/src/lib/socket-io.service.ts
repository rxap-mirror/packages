import { Observable } from 'rxjs';
import { share } from 'rxjs/operators';

import * as io from 'socket.io-client';

import { SocketIoConfig } from './socket-io.config';

export class WrappedSocket {
  subscribersCounter: Record<string, number> = {};
  eventObservables$: Record<string, Observable<any>> = {};
  ioSocket: any;
  emptyConfig: SocketIoConfig = {
    url: '',
    options: {},
  };

  constructor(private config: SocketIoConfig) {
    if (config === undefined) {
      config = this.emptyConfig;
    }
    const url: string = config.url;
    const options: any = config.options;
    const ioFunc = (io as any).default ? (io as any).default : io;
    this.ioSocket = ioFunc(url, options);
  }

  of(namespace: string) {
    this.ioSocket.of(namespace);
  }

  on<T>(eventName: string, callback: (data: T) => void) {
    this.ioSocket.on(eventName, callback);
  }

  once<T>(eventName: string, callback: (data: T) => void) {
    this.ioSocket.once(eventName, callback);
  }

  connect() {
    return this.ioSocket.connect();
  }

  disconnect(_close?: any) {
    return this.ioSocket.disconnect.apply(this.ioSocket, [_close]);
  }

  emit(_eventName: string, ..._args: any[]) {
    return this.ioSocket.emit.apply(this.ioSocket, [_eventName, ..._args]);
  }

  removeListener(_eventName: string, _callback?: () => void) {
    return this.ioSocket.removeListener.apply(this.ioSocket, [_eventName, _callback]);
  }

  removeAllListeners(_eventName?: string) {
    return this.ioSocket.removeAllListeners.apply(this.ioSocket, [_eventName]);
  }

  fromEvent<T>(eventName: string): Observable<T> {
    if (!this.subscribersCounter[eventName]) {
      this.subscribersCounter[eventName] = 0;
    }
    this.subscribersCounter[eventName]++;

    if (!this.eventObservables$[eventName]) {
      this.eventObservables$[eventName] = new Observable((observer: any) => {
        const listener = (data: T) => {
          observer.next(data);
        };
        this.ioSocket.on(eventName, listener);
        return () => {
          this.subscribersCounter[eventName]--;
          if (this.subscribersCounter[eventName] === 0) {
            this.ioSocket.removeListener(eventName, listener);
            delete this.eventObservables$[eventName];
          }
        };
      }).pipe(share());
    }
    return this.eventObservables$[eventName];
  }

  fromOneTimeEvent<T>(eventName: string): Promise<T> {
    return new Promise<T>(resolve => this.once(eventName, resolve));
  }
}
