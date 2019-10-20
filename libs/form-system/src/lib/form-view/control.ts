export class Control {

  public static fromElement(element: Element): Control {
    const control   = new Control();
    const controlId = element.getAttribute('id');
    if (!controlId) {
      throw new Error('Control element has not a id');
    }
    control.controlId   = controlId;
    control.componentId = element.getAttribute('component') || null;
    control.flex        = element.getAttribute('flex') || 'nogrow';
    control.hide        = element.getAttribute('hide') === 'true' || false;
    return control;
  }

  public get controlPath(): string {
    return [ this.formId, this.controlId ].join('.');
  }

  public flex = 'nogrow';
  public hide = false;
  public controlId!: string;
  public componentId: string | null = null;
  public formId!: string;

  public setFormId(formId: string): void {
    this.formId = formId;
  }

}
