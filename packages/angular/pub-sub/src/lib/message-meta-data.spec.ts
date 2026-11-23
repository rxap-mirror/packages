import { MessageMetaData } from './message-meta-data';

describe('MessageMetaData', () => {
  it('exposes topic, data, id and timestamp', () => {
    vi.useFakeTimers().setSystemTime(1234);
    const m = new MessageMetaData<{ a: number }>('t', { a: 1 });
    expect(m.topic).toBe('t');
    expect(m.data).toEqual({ a: 1 });
    expect(m.timestamp).toBe(1234);
    expect(m.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    vi.useRealTimers();
  });

  it('has an undefined payload by default and unique ids', () => {
    const a = new MessageMetaData('t');
    const b = new MessageMetaData('t');
    expect(a.data).toBeUndefined();
    expect(a.id).not.toBe(b.id);
  });
});
