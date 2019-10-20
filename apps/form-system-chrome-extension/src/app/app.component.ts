import { Component } from '@angular/core';

@Component({
  selector:    'rxap-root',
  templateUrl: './app.component.html',
  styleUrls:   [ './app.component.scss' ]
})
export class AppComponent {

  data: any[] = [];

  templates = new Map<string, string>();

  editorOptions = { theme: 'vs-dark', language: 'xml' };

  currentFormId: string | null   = null;
  currentTemplate: string | null = null;

  public port: any;

  constructor() {

    chrome.runtime.onConnect.addListener(port => {
      console.log('port', port);
      this.port = port;
      port.onMessage.addListener(msg => {
        console.log('msg', msg);
        this.data.push(msg);
        if (msg.rxap_form) {
          if (msg.formId) {
            this.templates.set(msg.formId, msg.template);
          }
        }
      });

      // document.getElementById("theButton").addEventListener("click",
      //   () => {
      //     port.postMessage({ rxap_form: true, joke: "Knock knock"});
      //   }, false);

    });

    // respose on the ping message from the content script
    chrome
      .runtime
      .onMessage
      .addListener((request, sender, sendResponse) =>
        sendResponse('pong')
      );

  }

  public addTemplate(formId: string, template: string): void {
  }


  getAll() {
    this.port.postMessage({ rxap_form: true, getAll: true });
  }

  update() {
    this.port.postMessage({ rxap_form: true, formId: this.currentFormId, template: this.currentTemplate });
  }

  selectTemplate(value: string) {
    this.currentFormId   = value;
    this.currentTemplate = this.templates.get(this.currentFormId)!;
  }
}
