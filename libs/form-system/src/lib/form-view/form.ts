import { Component } from './component';
import { Control } from './control';

export class Form {

  public get controls(): any[] {
    return this.components.map(component => {

      if (component instanceof Control) {
        return [ component ];
      }
      return component.controls;

    }).reduce((array, item) => [ ...array, ...item ], []);
  }

  public dataSource?: string;
  public title?: string;
  public subTitle?: string;

  constructor(
    public readonly id: string,
    public readonly components: Component[]
  ) { }
}
