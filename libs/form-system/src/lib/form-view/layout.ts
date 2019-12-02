import { Component } from './component';

export abstract class Layout extends Component {

  public abstract readonly orientation: 'row' | 'column';
  public gap: string = '0';
  public align?: string;

  constructor(public readonly components: Component[]) {
    super();
  }

}

export class Column extends Layout {

  public readonly orientation = 'column';

}

export class Row extends Layout {

  public readonly orientation = 'row';

}
