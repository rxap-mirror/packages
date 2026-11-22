import { ExecuteWorkflowTrigger } from './ExecuteWorkflowTrigger/ExecuteWorkflowTrigger.node';
import { ManualTrigger } from './ManualTrigger/ManualTrigger.node';

function triggerContext(input: unknown) {
  return {
    emit: jest.fn(),
    getNodeParameter: jest.fn(() => input),
    helpers: { returnJsonArray: jest.fn((a: unknown[]) => a.map((json) => ({ json }))) },
  } as any;
}

describe('ManualTrigger', () => {
  const node = new ManualTrigger();

  it('describes a trigger node without inputs', () => {
    expect(node.description.name).toBe('developmentManualTrigger');
    expect(node.description.inputs).toEqual([]);
    expect(node.description.properties.map((p) => p.name)).toEqual(['input']);
  });

  it('emits the parsed input on manual trigger', async () => {
    const ctx = triggerContext('{"a":1}');
    const res = await node.trigger.call(ctx);
    await res.manualTriggerFunction!();
    expect(ctx.emit).toHaveBeenCalledWith([[{ json: { a: 1 } }]]);
  });

  it('emits an empty object for the empty default input', async () => {
    const ctx = triggerContext('');
    const res = await node.trigger.call(ctx);
    await res.manualTriggerFunction!();
    expect(ctx.emit).toHaveBeenCalledWith([[{ json: {} }]]);
  });

  it('fails on invalid json', async () => {
    const ctx = triggerContext('{nope');
    const res = await node.trigger.call(ctx);
    await expect(res.manualTriggerFunction!()).rejects.toThrow(SyntaxError);
  });
});

describe('ExecuteWorkflowTrigger', () => {
  const node = new ExecuteWorkflowTrigger();

  it('is a single-instance trigger', () => {
    expect(node.description.maxNodes).toBe(1);
    expect(node.description.group).toEqual(['trigger']);
    expect(node.description.properties.map((p) => p.name)).toEqual(['input', 'events']);
  });

  it('emits the parsed input on manual trigger', async () => {
    const ctx = triggerContext('{"b":2}');
    const res = await node.trigger.call(ctx);
    await res.manualTriggerFunction!();
    expect(ctx.emit).toHaveBeenCalledWith([[{ json: { b: 2 } }]]);
  });

  it('execute returns the parsed input in manual mode', async () => {
    const ctx = { getMode: () => 'manual', getNodeParameter: jest.fn(() => '{"c":3}'), getInputData: jest.fn() } as any;
    await expect(node.execute.call(ctx)).resolves.toEqual([[{ json: { c: 3 } }]]);
    expect(ctx.getNodeParameter).toHaveBeenCalledWith('input', 0);
  });

  it('execute handles an empty input in manual mode', async () => {
    const ctx = { getMode: () => 'manual', getNodeParameter: () => '', getInputData: jest.fn() } as any;
    await expect(node.execute.call(ctx)).resolves.toEqual([[{ json: {} }]]);
  });

  it('execute passes through the input data when triggered by another workflow', async () => {
    const data = [{ json: { x: 1 } }];
    const ctx = { getMode: () => 'integrated', getInputData: () => data } as any;
    await expect(node.execute.call(ctx)).resolves.toEqual([data]);
  });
});
