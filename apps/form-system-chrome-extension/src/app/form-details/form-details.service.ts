import { Injectable } from '@angular/core';
import { FormTemplatesService } from '../form-templates.service';
import { Subject } from 'rxjs';
import {
  tap,
  filter
} from 'rxjs/operators';
import { FormInstancesService } from '../form-instances.service';

@Injectable({
  providedIn: 'root'
})
export class FormDetailsService {

  public formTemplate: string | null = null;
  public formId: string | null       = null;
  public formInstanceIds: string[]   = [];

  public update$ = new Subject<void>();

  constructor(
    public templatesService: FormTemplatesService,
    public instancesService: FormInstancesService
  ) {
    console.log('FormDetailsService');
    this.templatesService.update$.pipe(
      filter(formId => formId === this.formId),
      tap(() => this.setFormId(this.formId))
    ).subscribe();
    this.instancesService.update$.pipe(
      tap(formId => console.log('update instances', formId)),
      filter(formId => formId === this.formId),
      tap(() => this.formInstanceIds = this.instancesService.getInstanceIds(this.formId))
    ).subscribe();
  }

  public setFormId(formId: string): void {
    this.formId = formId;
    if (this.formId) {
      this.formTemplate = this.templatesService.get(this.formId);
    } else {
      this.formTemplate = null;
    }
    console.log('set form id', { formId: this.formId, template: this.formTemplate });
    this.update$.next();
  }

  public updateTemplate(template: string): void {
    this.templatesService.save(this.formId, template);
  }

  public loadInstanceIds(): void {
    if (this.formId) {
      this.instancesService.load(this.formId);
    } else {
      throw new Error('Could not load form instances. Form Id is not defined');
    }
  }

}
