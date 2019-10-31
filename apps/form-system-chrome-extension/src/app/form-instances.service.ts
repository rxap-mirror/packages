import { Injectable } from '@angular/core';
import { PortService } from './port.service';
import {
  filter,
  tap,
  map
} from 'rxjs/operators';
import {
  FormId,
  FormInstanceId
} from '@rxap/form-system';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FormInstancesService {

  public instances = new Map<FormId, FormInstanceId[]>();

  public update$ = new Subject<FormId>();

  constructor(public readonly portService: PortService) {
    console.log('FormInstancesService');
    this.portService.receive$.pipe(
      filter(payload => payload.formId && payload.instanceIds),
      tap(payload => console.log('add form instance ids', payload)),
      tap(payload => this.instances.set(payload.formId, payload.instanceIds)),
      tap(payload => this.update$.next(payload.formId))
    ).subscribe();
  }

  public load(formId: FormId): void {
    this.portService.send({ formId, getInstances: true });
  }

  public getInstanceIds(formId: FormId): FormInstanceId[] {
    return this.instances.get(formId) || [];
  }

  public getInstanceValue$(instanceId: FormInstanceId): any {
    this.portService.send({ instanceId, getValue: true });
    return this.portService.receive$.pipe(
      filter(payload => payload.instanceId && payload.value),
      map(payload => payload.value)
    );
  }

  public getInstanceErrors$(instanceId: FormInstanceId): any {
    this.portService.send({ instanceId, getErrors: true });
    return this.portService.receive$.pipe(
      filter(payload => payload.instanceId && payload.errors),
      map(payload => payload.errors)
    );
  }

}
