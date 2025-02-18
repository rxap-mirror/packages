import { join } from 'path';
import { PatternTriggerNode } from '../pattern-trigger-node';

export class EventTrigger extends PatternTriggerNode {
  constructor() {
    super(join(__dirname, 'schema.json'), 'event');
  }
}
