import { dasherize } from '@rxap/schematics-utilities';
import { buildOptionsOperationPath } from './build-options-operation-path';

jest.mock('@rxap/schematics-utilities', () => ({
  dasherize: jest.fn((s) => s),
}));

describe('buildOptionsOperationPath', () => {
  it('should return correct operation path', () => {
    expect(buildOptionsOperationPath({ name: 'test' })).toBe('control/test/table-select/page');
  });
});
