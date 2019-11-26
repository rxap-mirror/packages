export abstract class Component {

  public get controls(): any[] {
    return this.components.map(component => {

      if (component.hasOwnProperty('controlId')) {
        return [ component ];
      }
      return component.controls;

    }).reduce((array, item) => [ ...array, ...item ], []);
  }

  public components: Component[] = [];

  public abstract setFormId(formId: string): void;

}
