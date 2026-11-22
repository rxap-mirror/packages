import {
  inject,
  Injectable,
} from '@angular/core';
import {
  getToken,
  onMessage,
} from 'firebase/messaging';
import { ReplaySubject } from 'rxjs';
import {
  FIREBASE_MESSAGING,
  FIREBASE_MESSAGING_VAPID_KEY,
  RXAP_REQUEST_CLOUD_MESSAGING_TOKEN,
} from './tokens';

export interface Message {
  collapse_key: string;
  from: string;
  notification: {
    body: string;
    click_action: string;
    title: string;
  };
}

@Injectable({ providedIn: 'root' })
export class RxapFirebaseMessagingService {
  readonly messaging = inject(FIREBASE_MESSAGING, { optional: true }) ?? null;
  readonly vapidKey = inject(FIREBASE_MESSAGING_VAPID_KEY, { optional: true }) ?? null;
  readonly requestPermissionImminently = inject(RXAP_REQUEST_CLOUD_MESSAGING_TOKEN, { optional: true }) ?? false;

  public token$ = new ReplaySubject<string | null>(1);

  constructor() {
    if (this.messaging) {
      onMessage(this.messaging, message => {
        if (message.notification?.title) {
          this.showNotification(message.notification.title, message.notification.body ?? '');
        }
      });
    }
    if (this.requestPermissionImminently) {
      void this.requestPermission();
    }
  }

  public async requestPermission(): Promise<void> {
    if (!this.messaging) {
      console.warn('firebase cloud messaging is not supported in this environment');
      return;
    }
    console.log('request notification permission');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('notification permission is not granted');
      }
      const serviceWorkerRegistration = typeof navigator !== 'undefined' && navigator.serviceWorker ?
        await navigator.serviceWorker.getRegistration() :
        undefined;
      const token = await getToken(this.messaging, {
        vapidKey: this.vapidKey ?? undefined,
        serviceWorkerRegistration,
      });
      console.info('cloud messaging permission is granted');
      this.token$.next(token);
    } catch (error) {
      console.error('cloud messaging permission is denied', error);
    }
  }

  public showNotification(title: string, body: string): void {
    // Let's check if the browser supports notifications
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
    }

    // Let's check whether notification permissions have already been granted
    else if (Notification.permission === 'granted') {
      // If it's okay let's create a notification
      new Notification(title, { body });
    } else {
      console.warn('Notification permission is not granted');
    }
  }
}
