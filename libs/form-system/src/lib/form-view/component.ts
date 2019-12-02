import { Control } from './control';

export abstract class Component {

  public get controls(): any[] {
    return this.components.map(component => {

      if (component instanceof Control) {
        return [ component ];
      }
      return component.controls;

    }).reduce((array, item) => [ ...array, ...item ], []);
  }

  public flex = 'nogrow';

  public components: Component[] = [];

}
