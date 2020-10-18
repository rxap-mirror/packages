import {
  Injectable,
  Inject,
  Optional
} from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { RXAP_REQUEST_CLOUD_MESSAGING_TOKEN } from './tokens';

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

  public token$ = new BehaviorSubject<string | null>(null);

  constructor(
    public readonly messaging: AngularFireMessaging,
    @Optional() @Inject(RXAP_REQUEST_CLOUD_MESSAGING_TOKEN) public readonly requestPermissionImminently: boolean = false
  ) {
    this.messaging.tokenChanges.pipe(
      tap(token => this.token$.next(token))
    ).subscribe();
    this.messaging.messages.pipe(
      tap((message: any) => this.showNotification(message.notification.title, message.notification.body))
    ).subscribe();
    if (this.requestPermissionImminently) {
      this.requestPermission();
    }
  }

  public requestPermission() {
    this
      .messaging
      .requestPermission
      .subscribe(
        () => console.info('cloud messaging permission is granted'),
        () => console.error('cloud messaging permission is denied')
      );
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
