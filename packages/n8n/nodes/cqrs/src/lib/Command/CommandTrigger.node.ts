import { join } from 'path';
import { PatternTriggerNode } from '../pattern-trigger-node';

export class CommandTrigger extends PatternTriggerNode {
  constructor() {
    super(join(__dirname, 'schema.json'), 'command');
  }
}
