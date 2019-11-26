import { Step } from './step';
import { Component } from './component';

export class Stepper extends Component {

  public components: Step[] = [];

  public setFormId(formId: string): void {
    this.components.forEach(step => step.setFormId(formId));
  }

}
