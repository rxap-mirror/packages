import { Component } from './component';

export class Step extends Component {

  constructor(
    public readonly label: string,
    public readonly components: Component[]
  ) {
    super();
  }

}
