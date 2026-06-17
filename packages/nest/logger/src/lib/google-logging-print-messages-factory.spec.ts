import { googleLoggingPrintMessagesFactory } from './google-logging-print-messages-factory';

describe('googleLoggingPrintMessagesFactory', () => {

  const env = { production: false } as any;

  function capture(messages: unknown[], context = '', level: any = 'log') {
    const print = googleLoggingPrintMessagesFactory(env);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      print(messages, context, level);
      expect(spy).toHaveBeenCalledTimes(1);
      return JSON.parse(spy.mock.calls[0][0] as string);
    } finally {
      spy.mockRestore();
    }
  }

  it('should preserve a single object argument in the payload', () => {
    const payload = capture([ { userId: 1 } ]);
    expect(payload.userId).toBe(1);
    expect(payload.severity).toBe('INFO');
  });

  it('should preserve all arguments when the first is a non-string', () => {
    const payload = capture([ { a: 1 }, { b: 2 } ]);
    expect(payload.messages).toEqual([ { a: 1 }, { b: 2 } ]);
  });

  it('should keep the string message and attach interpolated args', () => {
    const payload = capture([ 'value %JSON', { x: 1 } ], 'Ctx');
    expect(payload.message).toBe('[Ctx] value %JSON');
    expect(payload.interpolates).toEqual([ { x: 1 } ]);
  });

  it('should not mutate the input messages array', () => {
    const messages = [ 'hello', { x: 1 } ];
    capture(messages);
    expect(messages).toEqual([ 'hello', { x: 1 } ]);
  });

});
