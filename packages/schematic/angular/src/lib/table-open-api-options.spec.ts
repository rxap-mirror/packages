import { NormalizeTableOpenApiOptions } from './table-open-api-options';

jest.mock('./adapter-options', () => ({
  NormalizeAdapterOptions: jest.fn((a) => a),
}));

describe('NormalizeTableOpenApiOptions', () => {
  it('should return null if operationId is missing', () => {
    expect(NormalizeTableOpenApiOptions()).toBeNull();
    expect(NormalizeTableOpenApiOptions({} as any)).toBeNull();
  });

  it('should normalize table open api options', () => {
    const input = { operationId: 'get' };
    const result = NormalizeTableOpenApiOptions(input as any);
    expect(result!.operationId).toBe('get');
  });
});
