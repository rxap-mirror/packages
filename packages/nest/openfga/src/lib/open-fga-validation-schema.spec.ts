import { Environment } from '@rxap/nest-utilities';
import { openFgaValidationSchema } from './open-fga-validation-schema';

describe('openFgaValidationSchema', () => {

  const environment: Environment = { app: 'jest-testing', production: false };

  it('should create SchemaMap', () => {

    const schema = openFgaValidationSchema(environment);

    expect(schema).toHaveProperty('FGA_API_URL');
    expect(schema).toHaveProperty('FGA_STORE_ID');
    expect(schema).toHaveProperty('FGA_AUTHORIZATION_MODEL_ID');
    expect(schema).toHaveProperty('FGA_API_TOKEN');

  });

});
