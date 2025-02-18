import { join } from 'path';
import { PatternNode } from '../pattern-node';

export class Command extends PatternNode {

  constructor() {
    super(join(__dirname, 'schema.json'), 'command', true);
  }

}
