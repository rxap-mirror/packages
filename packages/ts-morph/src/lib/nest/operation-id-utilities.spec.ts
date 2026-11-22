import {
  OpenApiResponseClassImportPath,
  OperationIdToClassRemoteMethodImportPath,
  OperationIdToCommandClassImportPath,
  OperationIdToCommandClassName,
  OperationIdToParameterClassImportPath,
  OperationIdToParameterClassName,
  OperationIdToRemoteMethodClassName,
  OperationIdToRequestBodyClassImportPath,
  OperationIdToRequestBodyClassName,
  OperationIdToResponseClassImportPath,
  OperationIdToResponseClassName,
} from './operation-id-utilities';

describe('operation id utilities', () => {
  const original = process.env['RXAP_LEGACY_OPEN_API_CLIENT_SDK'];
  afterEach(() => {
    if (original === undefined) delete process.env['RXAP_LEGACY_OPEN_API_CLIENT_SDK'];
    else process.env['RXAP_LEGACY_OPEN_API_CLIENT_SDK'] = original;
  });

  it('builds class names and ignores the server id', () => {
    expect(OperationIdToRemoteMethodClassName('get-user@my-server')).toBe('GetUserRemoteMethod');
    expect(OperationIdToCommandClassName('createUser')).toBe('CreateUserCommand');
    expect(OperationIdToResponseClassName('list_all@x')).toBe('ListAllResponse');
    expect(OperationIdToParameterClassName('get-user')).toBe('GetUserParameter');
    expect(OperationIdToRequestBodyClassName('get-user')).toBe('GetUserRequestBody');
  });

  describe('modern layout', () => {
    beforeEach(() => delete process.env['RXAP_LEGACY_OPEN_API_CLIENT_SDK']);

    it('builds import paths', () => {
      expect(OperationIdToClassRemoteMethodImportPath('get-user@my-server')).toBe('open-api-my-server/src/lib/remote-methods');
      expect(OperationIdToClassRemoteMethodImportPath('get-user@my-server', '@scope')).toBe('@scope/open-api-my-server/src/lib/remote-methods');
      expect(OperationIdToClassRemoteMethodImportPath('get-user')).toBe('open-api-legacy/src/lib/remote-methods');
      expect(OperationIdToCommandClassImportPath('a@s')).toBe('open-api-s/src/lib/commands');
      expect(OperationIdToCommandClassImportPath('a@s', '@scope')).toBe('@scope/open-api-s/src/lib/commands');
      expect(OpenApiResponseClassImportPath('UserResponse', 's')).toBe('open-api-s/src/lib/responses');
      expect(OpenApiResponseClassImportPath('UserResponse', 's', '@scope')).toBe('@scope/open-api-s/src/lib/responses');
      expect(OperationIdToResponseClassImportPath('a@s')).toBe('open-api-s/src/lib/responses');
      expect(OperationIdToResponseClassImportPath('a@s', '@scope')).toBe('@scope/open-api-s/src/lib/responses');
      expect(OperationIdToParameterClassImportPath('a@s')).toBe('open-api-s/src/lib/parameters');
      expect(OperationIdToParameterClassImportPath('a@s', '@scope')).toBe('@scope/open-api-s/src/lib/parameters');
      expect(OperationIdToRequestBodyClassImportPath('a@s')).toBe('open-api-s/src/lib/request-bodies');
      expect(OperationIdToRequestBodyClassImportPath('a@s', '@scope')).toBe('@scope/open-api-s/src/lib/request-bodies');
    });
  });

  describe('legacy layout', () => {
    beforeEach(() => (process.env['RXAP_LEGACY_OPEN_API_CLIENT_SDK'] = 'true'));

    it('builds import paths', () => {
      expect(OperationIdToClassRemoteMethodImportPath('getUser@s')).toBe('open-api-s/remote-methods/get-user.remote-method');
      expect(OperationIdToClassRemoteMethodImportPath('getUser@s', '@scope')).toBe('@scope/open-api-s/remote-methods/get-user.remote-method');
      expect(OperationIdToCommandClassImportPath('getUser@s')).toBe('open-api-s/commands/get-user.command');
      expect(OperationIdToCommandClassImportPath('getUser@s', '@scope', true)).toBe('@scope/service-open-api-s/commands/get-user.command');
      expect(OperationIdToCommandClassImportPath('getUser@s', null, true)).toBe('service-open-api-s/commands/get-user.command');
      expect(OpenApiResponseClassImportPath('GetUserResponse', 's')).toBe('open-api-s/responses/get-user.response');
      expect(OpenApiResponseClassImportPath('GetUserResponse', 's', '@scope')).toBe('@scope/open-api-s/responses/get-user.response');
      expect(OperationIdToResponseClassImportPath('getUser@s')).toBe('open-api-s/responses/get-user.response');
      expect(OperationIdToResponseClassImportPath('getUser@s', '@scope')).toBe('@scope/open-api-s/responses/get-user.response');
      expect(OperationIdToParameterClassImportPath('getUser@s')).toBe('open-api-s/parameters/get-user.parameter');
      expect(OperationIdToParameterClassImportPath('getUser@s', '@scope')).toBe('@scope/open-api-s/parameters/get-user.parameter');
      expect(OperationIdToRequestBodyClassImportPath('getUser@s')).toBe('open-api-s/request-bodies/get-user.request-body');
      expect(OperationIdToRequestBodyClassImportPath('getUser@s', '@scope')).toBe('@scope/open-api-s/request-bodies/get-user.request-body');
    });
  });
});
