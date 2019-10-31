import { Injectable } from '@angular/core';
import { FormTemplateLoader } from '../form-template-loader';
import { fromEvent } from 'rxjs';
import {
  filter,
  map,
  tap,
  mergeMap
} from 'rxjs/operators';
import { FormInstanceFactory } from '../form-instance-factory';
import { isDefined } from '@rxap/utilities';
import { FormInstance } from '../form-instance';

@Injectable()
export class FormSystemDevToolService {

  constructor(
    public formTemplateLoader: FormTemplateLoader,
    public formInstances: FormInstanceFactory
  ) {}

  public start() {

    const message$ = fromEvent<MessageEvent>(window, 'message').pipe(
      filter(event => event.source === window),
      map(event => event.data),
      filter(data => data.rxap_form),
      tap(data => console.info('[FormSystemDevToolService] message', data))
    );

    message$.pipe(
      filter(data => data.content_loaded),
      tap(() => this.send({ start_connection: true }))
    ).subscribe();

    message$.pipe(
      filter(data => data.getAll),
      tap(() => {
        for (const [ formId, template ] of this.formTemplateLoader.templates.entries()) {
          this.send({ formId, template });
        }
      })
    ).subscribe();

    const withInstanceId$ = message$.pipe(
      filter(data => data.instanceId)
    );

    withInstanceId$.pipe(
      filter(data => data.getValue),
      map(data => this.formInstances.getFormInstanceById(data.instanceId)),
      isDefined(),
      mergeMap((instance: FormInstance<any>) => instance.formDefinition.group.valueChanged$.pipe(
        tap(value => this.send({ instanceId: instance.instanceId, value }))
      ))
    ).subscribe();

    withInstanceId$.pipe(
      filter(data => data.getErrors),
      map(data => this.formInstances.getFormInstanceById(data.instanceId)),
      isDefined(),
      mergeMap((instance: FormInstance<any>) => instance.formDefinition.group.errorTreeChange$.pipe(
        tap(errors => this.send({ instanceId: instance.instanceId, errors }))
      ))
    ).subscribe();

    const withFormId$ = message$.pipe(
      filter(data => data.formId)
    );

    withFormId$.pipe(
      filter(data => data.template),
      tap(data => this.formTemplateLoader.updateTemplate(data.formId, data.template))
    ).subscribe();

    withFormId$.pipe(
      filter(data => data.getInstances),
      tap(data => {

        const instanceIds = this.formInstances.getFormInstanceIdsByFormId(data.formId);

        console.log(instanceIds);

        this.send({ formId: data.formId, instanceIds });

      })
    ).subscribe();

  }

  public send(data: any): void {
    console.log('send', data);
    window.postMessage({ ...data, rxap_form: true }, '*');
  }

}
