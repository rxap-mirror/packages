export class Control {

  public static fromElement(element: Element): Control {
    const controlId = element.getAttribute('id');
    const component = element.getAttribute('component') || 'text';
    const formControl = element.getAttribute('control') || 'base';
    const control = new Control(controlId, component, formControl);
    control.flex = element.getAttribute('flex') || 'nogrow';
    control.hide = element.getAttribute('hide') === 'true' || false;
    return control;
  }

  public flex = 'nogrow';
  public hide = false;

  constructor(public controlId: string, public component: string, public formControl: string) {}

}
