import { Layout } from './layout';
import { Component } from './component';

export class Step extends Component {

  constructor(public layout: Layout, public label: string) {
    super();
    this.components = this.layout.components;
  }

  public setFormId(formId: string): void {
    this.layout.setFormId(formId);
  }

}
