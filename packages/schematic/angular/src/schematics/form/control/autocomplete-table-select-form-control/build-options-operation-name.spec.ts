import { dasherize } from '@rxap/schematics-utilities';
import { buildOptionsOperationName } from './build-options-operation-name';

jest.mock('@rxap/schematics-utilities', () => ({
  dasherize: jest.fn((s) => s),
}));

describe('buildOptionsOperationName', () => {
  it('should return correct operation name', () => {
    expect(buildOptionsOperationName({ name: 'test' })).toBe('get-test-control-table-select-page');
  });
});
