import { Injectable } from '@angular/core';
import { FormTemplateLoader } from '../form-template-loader';
import { fromEvent } from 'rxjs';
import {
  filter,
  map,
  tap
} from 'rxjs/operators';

@Injectable()
export class FormSystemDevToolService {

  constructor(public formTemplateLoader: FormTemplateLoader) {}

  public start() {
    this.send({ start_connection: true });

    const message$ = fromEvent<MessageEvent>(window, 'message').pipe(
      filter(event => event.source === window),
      map(event => event.data),
      filter(data => data.rxap_form)
    );

    message$.pipe(
      filter(data => data.getAll),
      tap(() => {
        for (const [ formId, template ] of this.formTemplateLoader.templates.entries()) {
          this.send({ formId, template });
        }
      })
    ).subscribe();

    const withFormId$ = message$.pipe(
      filter(data => data.formId)
    );

    withFormId$.pipe(
      filter(data => data.template),
      tap(data => this.formTemplateLoader.updateTemplate(data.formId, data.template))
    ).subscribe();

  }

  public send(data: any): void {
    console.log('send', data);
    window.postMessage({ ...data, rxap_form: true }, '*');
  }

}
