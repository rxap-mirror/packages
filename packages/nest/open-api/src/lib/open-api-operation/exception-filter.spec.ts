import { OpenApiOperationCommandException } from './open-api-operation-command-exception';
import { OpenApiOperationCommandExceptionFilter } from './open-api-operation-command-exception-filter';

const devMode = jest.fn();
jest.mock('@rxap/nest-utilities', () => ({
  ...jest.requireActual('@rxap/nest-utilities'),
  IsDevMode: () => devMode(),
}));

describe('OpenApiOperationCommandExceptionFilter', () => {
  const run = (status: number, message = 'msg') => {
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const host: any = { switchToHttp: () => ({ getResponse: () => res }) };
    const exception = new OpenApiOperationCommandException(
      'srv',
      { status } as any,
      { url: 'u' },
      { operationId: 'op' } as any,
      'rid',
      message,
    );
    new OpenApiOperationCommandExceptionFilter().catch(exception, host);
    return res;
  };

  it.each([404, 401, 403, 409])('passes %s through with a body', (status) => {
    const res = run(status, 'plain');
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.json).toHaveBeenCalledWith({
      statusCode: status,
      message: 'plain',
      operationId: 'op',
      serverId: 'srv',
      error: null,
    });
  });

  it('extracts structured upstream errors', () => {
    const res = run(404, 'e_42#Something broke');
    expect(res.json.mock.calls[0][0].error).toEqual({ code: 42, message: 'Something broke' });
  });

  it('maps other statuses to 500 and includes the config in dev mode', () => {
    devMode.mockReturnValue(true);
    let res = run(502);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ statusCode: 500, upstreamStatusCode: 502, operationId: 'op', config: { url: 'u' }, message: 'msg' });
    devMode.mockReturnValue(false);
    res = run(502);
    expect(res.json).toHaveBeenCalledWith({ statusCode: 500, upstreamStatusCode: 502, operationId: 'op', message: 'msg' });
  });
});
