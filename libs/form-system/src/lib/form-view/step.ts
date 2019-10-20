import { Layout } from './layout';

export class Step {

  constructor(public layout: Layout, public label: string) {}

  public setFormId(formId: string): void {
    this.layout.setFormId(formId);
  }

}
