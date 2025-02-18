import { join } from 'path';
import { PatternNode } from '../pattern-node';

export class Event extends PatternNode {

  constructor() {
    super(join(__dirname, 'schema.json'), 'event');
  }

}
