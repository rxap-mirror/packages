import { Injectable } from '@angular/core';
import { BaseForm } from './forms/base.form';

@Injectable({ providedIn: 'root' })
export class FormStateManager {

  public readonly stats = new Map<string, BaseForm<any, any, any>>();


  // TODO : use formId or instanceId

  /**
   *
   * @param fullControlPath {control.formId}.{control.controlPath}
   * @param form
   */
  public addForm(fullControlPath: string, form: BaseForm<any, any, any>): void {
    this.stats.set(fullControlPath, form);
  }

  public getForm<T extends BaseForm<any, any, any>>(controlPath: string): T {
    if (!this.stats.has(controlPath)) {
      throw new Error(`Form state with path '${controlPath}' not found`);
    }
    return this.stats.get(controlPath) as any;
  }

  public deleteForm(controlPath: string): boolean {
    this.getForm(controlPath).rxapOnDestroy();
    return this.stats.delete(controlPath);
  }

}
