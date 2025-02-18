import { join } from 'path';
import { PatternNode } from '../pattern-node';

export class Query extends PatternNode {

  constructor() {
    super(join(__dirname, 'schema.json'), 'query', true);
  }

}
