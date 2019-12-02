import { Component } from './component';
import { Control } from './control';

export class Form {

  public get controls(): Control[] {
    return this.components.map(component => {

      if (component instanceof Control) {
        return [ component ];
      }
      return component.controls;

    }).reduce((array, item) => [ ...array, ...item ], []).map((control: Control) => {
      control.formId = this.id;
      return control;
    });
  }

  public dataSource?: string;
  public title?: string;
  public subTitle?: string;

  constructor(
    public id: string,
    public readonly components: Component[]
  ) { }
}
