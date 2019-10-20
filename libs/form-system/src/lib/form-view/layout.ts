export class Layout {

  public components: any[]             = [];
  public orientation: 'row' | 'column' = 'row';
  public gap: string                   = '0';
  public align: string                 = '';

  public setFormId(formId: string): void {
    this.components.forEach(component => component.setFormId(formId));
  }

}
