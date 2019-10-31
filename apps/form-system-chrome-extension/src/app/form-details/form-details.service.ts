import { Injectable } from '@angular/core';
import { FormTemplatesService } from '../form-templates.service';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FormDetailsService {

  public formTemplate: string | null = null;
  public formId: string | null       = null;

  public update$ = new Subject<void>();

  constructor(
    public templatesService: FormTemplatesService
  ) {
    console.log('FormDetailsService');
    this.templatesService.update$.pipe(
      tap(() => this.setFormId(this.formId))
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

}
