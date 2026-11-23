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

  it.each([
    [ 'log', 'INFO' ],
    [ 'debug', 'DEBUG' ],
    [ 'warn', 'WARNING' ],
    [ 'error', 'ERROR' ],
    [ 'fatal', 'CRITICAL' ],
    [ 'verbose', 'DEFAULT' ],
  ])('should map the log level %s to the severity %s', (level, severity) => {
    expect(capture([ 'message' ], '', level).severity).toBe(severity);
  });

  it('should delegate to the default output when there are no messages', () => {
    const print = googleLoggingPrintMessagesFactory(env);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      expect(print([], '', 'log')).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('should return false after writing the entry', () => {
    const print = googleLoggingPrintMessagesFactory(env);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
    try {
      expect(print([ 'message' ], '', 'log')).toBe(false);
    } finally {
      spy.mockRestore();
    }
  });

  it('should wrap a single array argument into items', () => {
    const payload = capture([ [ 1, 2, 3 ] ]);
    expect(payload.items).toEqual([ 1, 2, 3 ]);
    expect(payload.message).toBeUndefined();
  });

  it.each([
    [ 42, '42' ],
    [ true, 'true' ],
    [ null, 'null' ],
  ])('should stringify the single primitive argument %p into the message', (value, message) => {
    expect(capture([ value ]).message).toBe(message);
  });

  it('should prefix the message with the context', () => {
    expect(capture([ 'hello' ], 'MyContext').message).toBe('[MyContext] hello');
  });

  it('should keep a message without context unprefixed and without payload fields', () => {
    const payload = capture([ 'hello' ]);
    expect(payload.message).toBe('hello');
    expect(payload.interpolates).toBeUndefined();
    expect(payload.args).toBeUndefined();
  });

  it('should add remaining arguments after the interpolated ones as args', () => {
    const payload = capture([ 'a %JSON b', 1, 'extra', { y: 2 } ]);
    expect(payload.interpolates).toEqual([ 1 ]);
    expect(payload.args).toEqual([ 'extra', { y: 2 } ]);
  });

  it('should add arguments without %JSON placeholder as args', () => {
    const payload = capture([ 'plain', 'x', 'y' ]);
    expect(payload.interpolates).toBeUndefined();
    expect(payload.args).toEqual([ 'x', 'y' ]);
  });

  it('should count multiple %JSON placeholders', () => {
    const payload = capture([ '%JSON-%JSON', 1, 2, 3 ]);
    expect(payload.interpolates).toEqual([ 1, 2 ]);
    expect(payload.args).toEqual([ 3 ]);
  });

  describe('labels', () => {

    function captureWith(environment: any, context = '') {
      const print = googleLoggingPrintMessagesFactory(environment);
      const spy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
      try {
        print([ 'message' ], context, 'log');
        return JSON.parse(spy.mock.calls[0][0] as string);
      } finally {
        spy.mockRestore();
      }
    }

    it('should always label the production flag', () => {
      expect(captureWith({ production: true })['logging.googleapis.com/labels']).toEqual({ production: 'true' });
      expect(captureWith({ production: false })['logging.googleapis.com/labels']).toEqual({ production: 'false' });
    });

    it('should map all environment properties to labels', () => {
      const payload = captureWith({
        app: 'my-app',
        production: true,
        release: '1.0.0',
        commit: 'abc',
        branch: 'main',
        tag: 'v1',
        timestamp: '2026-01-01',
        tier: 'prod',
        name: 'production',
      }, 'Ctx');
      expect(payload['logging.googleapis.com/labels']).toEqual({
        app: 'my-app',
        production: 'true',
        release: '1.0.0',
        gitCommit: 'abc',
        gitBranch: 'main',
        gitTag: 'v1',
        buildTimestamp: '2026-01-01',
        environmentTier: 'prod',
        environmentName: 'production',
        context: 'Ctx',
      });
    });

    it('should add the context label', () => {
      const payload = captureWith({ production: false }, 'Ctx');
      expect(payload['logging.googleapis.com/labels'].context).toBe('Ctx');
    });

  });

});
