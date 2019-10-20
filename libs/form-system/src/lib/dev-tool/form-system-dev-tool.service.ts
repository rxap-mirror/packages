import { Injectable } from '@angular/core';
import { FormTemplateLoader } from '../form-template-loader';

@Injectable()
export class FormSystemDevToolService {

  constructor(public formTemplateLoader: FormTemplateLoader) {}

  public start() {
    this.send({ start_connection: true });
    window.addEventListener('message', event => {
      if (event.source !== window) {
        console.log('skip');
        return;
      }

      const data = event.data;

      if (data.rxap_form) {

        console.log('get from popup', event.data);

        if (data.content_loaded) {
          this.send({ start_connection: true });
        }

        if (data.getAll) {
          for (const [ formId, template ] of this.formTemplateLoader.templates.entries()) {
            this.send({ formId, template });
          }
        }

        if (data.formId) {
          this.formTemplateLoader.updateTemplate(data.formId, data.template);
        }

      }

    }, false);
  }

  public send(data: any): void {
    console.log('send', data);
    window.postMessage({ ...data, rxap_form: true }, '*');
  }

}
