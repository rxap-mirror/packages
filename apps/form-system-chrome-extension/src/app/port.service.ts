import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortService {

  public port: any;

  public receive$ = new Subject<any>();

  constructor() {
    console.log('PortService');
    chrome.storage.local.get((items) => {
      console.log('items', items);
    });

    chrome.runtime.onConnect.addListener(port => {
      console.log('port', port);
      this.port = port;
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
    this.port.postMessage({
      ...data,
      rxap_form: true
    });
  }

}
