import { Injectable } from '@angular/core';
import { PortService } from './port.service';
import {
  filter,
  tap
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormId } from '@rxap/form-system';

@Injectable({
  providedIn: 'root'
})
export class FormTemplatesService {

  public update$    = new Subject<FormId>();
  private templates = new Map<string, string>();

  constructor(
    public readonly portService: PortService
  ) {
    console.log('FormTemplatesService');
    this.portService.receive$.pipe(
      filter(payload => payload.formId && payload.template),
      tap(payload => console.log('add template', payload)),
      tap(payload => this.templates.set(payload.formId, payload.template)),
      tap(payload => this.update$.next(payload.formId))
    ).subscribe();
  }

  public get(formId: string): string {
    return this.templates.get(formId);
  }

  public save(formId: string, template: string): void {
    this.templates.set(formId, template);
    this.portService.send({ formId, template });
  }

  public load(): void {
    this.portService.send({ getAll: true });
  }

}
