import { Injectable } from '@angular/core';
import { PortService } from './port.service';
import {
  filter,
  tap
} from 'rxjs/operators';
import { Subject } from 'rxjs';
import { FormId } from '@rxap/form-system';
import { FormsService } from './forms.service';

@Injectable({
  providedIn: 'root'
})
export class FormTemplatesService {

  public update$    = new Subject<FormId>();
  private templates = new Map<string, string>();

  constructor(
    public readonly portService: PortService,
    public readonly formService: FormsService,
  ) {
    console.log('FormTemplatesService');
    this.portService.receive$.pipe(
      filter(payload => payload.formId && payload.template),
      tap(payload => console.log('add template', payload)),
      tap(payload => this.templates.set(payload.formId, payload.template)),
      tap(payload => this.update$.next(payload.formId))
    ).subscribe();
    this.portService.ready$.pipe(
      filter(Boolean),
      tap(() => this.load())
    ).subscribe();
  }

  public get(formId: string): string {
    return this.templates.get(formId);
  }

  public save(formId: string, template: string, toDisk: boolean = false): void {
    this.templates.set(formId, template);
    this.portService.send({ formId, template, save: toDisk });
  }

  public load(): void {
    this.portService.send({ getAll: true });
  }

  public set(formId: string, template: string): void {
    this.templates.set(formId, template);
    this.formService.addFormId(formId);
    this.update$.next(formId);
  }

  saveAll() {
    this.portService.send({ saveAll: true });
  }
}
