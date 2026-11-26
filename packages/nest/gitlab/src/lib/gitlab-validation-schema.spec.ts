import { Environment } from '@rxap/nest-utilities';
import * as Joi from 'joi';
import { gitlabValidationSchema } from './gitlab-validation-schema';

const production = { app: 'test', production: true } as Environment;
const development = { app: 'test', production: false } as Environment;

function validate(environment: Environment, env: Record<string, unknown>, options?: { host?: string }) {
  return Joi.object(gitlabValidationSchema(environment, options)).validate(env);
}

describe('gitlabValidationSchema', () => {
  it('defaults GITLAB_HOST to https://gitlab.com', () => {
    expect(validate(development, {}).value.GITLAB_HOST).toBe('https://gitlab.com');
  });

  it('uses the host option as default for GITLAB_HOST', () => {
    expect(validate(development, {}, { host: 'https://git.example.com' }).value.GITLAB_HOST).toBe(
      'https://git.example.com',
    );
  });

  it('keeps an explicit GITLAB_HOST', () => {
    expect(validate(development, { GITLAB_HOST: 'https://x.test' }).value.GITLAB_HOST).toBe('https://x.test');
  });

  describe('production', () => {
    it('requires a token', () => {
      expect(validate(production, {}).error).toBeDefined();
    });

    it('accepts GITLAB_TOKEN alone', () => {
      expect(validate(production, { GITLAB_TOKEN: 't' }).error).toBeUndefined();
    });

    it('accepts GITLAB_OAUTH_TOKEN alone', () => {
      expect(validate(production, { GITLAB_OAUTH_TOKEN: 't' }).error).toBeUndefined();
    });

    it('rejects both tokens', () => {
      expect(validate(production, { GITLAB_TOKEN: 'a', GITLAB_OAUTH_TOKEN: 'b' }).error).toBeDefined();
    });
  });

  describe('non production', () => {
    it('does not require a token', () => {
      expect(validate(development, {}).error).toBeUndefined();
    });

    it('accepts either token', () => {
      expect(validate(development, { GITLAB_TOKEN: 't' }).error).toBeUndefined();
      expect(validate(development, { GITLAB_OAUTH_TOKEN: 't' }).error).toBeUndefined();
    });

    it('rejects both tokens', () => {
      expect(validate(development, { GITLAB_TOKEN: 'a', GITLAB_OAUTH_TOKEN: 'b' }).error).toBeDefined();
    });
  });

  describe('GITLAB_PROJECT', () => {
    it('is optional', () => {
      expect(validate(development, {}).value).not.toHaveProperty('GITLAB_PROJECT');
      expect(validate(production, { GITLAB_TOKEN: 't' }).error).toBeUndefined();
    });

    it('accepts a numeric id and a path', () => {
      expect(validate(development, { GITLAB_PROJECT: '1234' }).error).toBeUndefined();
      expect(validate(development, { GITLAB_PROJECT: 'group/sub/project' }).error).toBeUndefined();
    });

    it('rejects an empty value', () => {
      expect(validate(development, { GITLAB_PROJECT: '' }).error).toBeDefined();
    });
  });
});
