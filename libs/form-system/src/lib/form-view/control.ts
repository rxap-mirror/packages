export class Control {

  public static fromElement(element: Element): Control {
    const control       = new Control();
    control.controlId   = element.getAttribute('id');
    control.componentId = element.getAttribute('component') || null;
    control.flex        = element.getAttribute('flex') || 'nogrow';
    control.hide        = element.getAttribute('hide') === 'true' || false;
    return control;
  }

  public flex = 'nogrow';
  public hide = false;
  public controlId: string;
  public componentId: string | null;

}
