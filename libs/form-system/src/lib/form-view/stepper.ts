import { Step } from './step';
import { Component } from './component';

export class Stepper extends Component {

  constructor(public readonly components: Step[]) {
    super();
  }

}
