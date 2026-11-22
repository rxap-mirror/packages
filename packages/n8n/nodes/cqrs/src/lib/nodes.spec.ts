import { Command } from './Command/Command.node';
import { CommandTrigger } from './Command/CommandTrigger.node';
import { Event } from './Event/Event.node';
import { EventTrigger } from './Event/EventTrigger.node';
import { Query } from './Query/Query.node';
import { QueryTrigger } from './Query/QueryTrigger.node';

describe('cqrs nodes', () => {
  it.each([
    ['command', Command, true],
    ['command', CommandTrigger, false],
    ['event', Event, true],
    ['event', EventTrigger, false],
    ['query', Query, true],
    ['query', QueryTrigger, false],
  ] as const)('%s node %p loads its schema', (prefix, Ctor: any, hasExecute) => {
    const node = new Ctor();
    expect(node.description.properties.find((p: any) => p.name === 'routingKeyPrefix').default).toBe(prefix);
    expect(typeof (hasExecute ? node.execute : node.trigger)).toBe('function');
    expect(node.description.credentials[0].name).toBe('rabbitmq');
  });
});
