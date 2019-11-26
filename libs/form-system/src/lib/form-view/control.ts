import { Options } from './options';
import { Component } from './component';

export class Control extends Component {


  public static fromElement(element: Element): Control {
    const control   = new Control();
    const controlId = element.getAttribute('id');
    if (!controlId) {
      throw new Error('Control element has not a id');
    }
    control.controlId   = controlId;
    control.componentId = element.getAttribute('component') || null;
    control.flex        = element.getAttribute('flex') || 'nogrow';
    control.name        = element.getAttribute('name') || 'input';
    control.hide        = element.getAttribute('hide') === 'true' || false;

    element.childNodes.forEach((child: any) => {

      switch (child.nodeNames) {

        case 'options':
          control.options = Options.formElement(child);

      }

    });

    return control;
  }

  public get controlPath(): string {
    return [ this.formId, this.controlId ].join('.');
  }

  public name                       = 'input';
  public flex                       = 'nogrow';
  public hide                       = false;
  public controlId!: string;
  public componentId: string | null = null;
  public formId!: string;
  public options: Options | null    = null;

  public setFormId(formId: string): void {
    this.formId = formId;
  }

}
