import { Step } from './step';

export class Stepper {

  steps: Step[] = [];

  public setFormId(formId: string): void {
    this.steps.forEach(step => step.setFormId(formId));
  }

}
