import { join } from 'path';
import { PatternTriggerNode } from '../pattern-trigger-node';

export class QueryTrigger extends PatternTriggerNode {
  constructor() {
    super(join(__dirname, 'schema.json'), 'query');
  }
}
