import { Injectable } from '@angular/core';
import {
  Subject,
  BehaviorSubject
} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortService {

  public port: any;

  public receive$ = new Subject<any>();

  public ready$ = new BehaviorSubject<boolean>(false);

  constructor() {
    console.log('PortService');

    if (!chrome.storage) {
      console.info('In test mode');
      return;
    }

    chrome.storage.local.get((items) => {
      console.log('items', items);
    });

    chrome.runtime.onConnect.addListener(port => {
      console.log('port', port);
      this.port = port;
      this.ready$.next(true);
      port.onMessage.addListener(msg => {
        console.log('msg', msg);
        if (msg.rxap_form) {
          this.receive$.next(msg);
        }
      });

    });

    // respose on the ping message from the content script
    chrome
      .runtime
      .onMessage
      .addListener((request, sender, sendResponse) =>
        sendResponse('pong')
      );

  }

  public send(data: object): void {
    if (this.port) {
      this.port.postMessage({
        ...data,
        rxap_form: true
      });
    } else {
      console.warn('could not send', data);
    }
  }

}
