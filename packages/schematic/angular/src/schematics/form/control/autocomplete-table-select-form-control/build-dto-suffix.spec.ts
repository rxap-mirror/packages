import { dasherize } from '@rxap/schematics-utilities';
import { joinWithDash } from '@rxap/utilities';
import { buildDtoSuffix } from './build-dto-suffix';

jest.mock('@rxap/schematics-utilities', () => ({
  dasherize: jest.fn((s) => s),
}));

jest.mock('@rxap/utilities', () => ({
  joinWithDash: jest.fn((a) => a.join('-')),
}));

describe('buildDtoSuffix', () => {
  it('should return correct dto suffix', () => {
    expect(buildDtoSuffix({ context: 'ctx', name: 'test' } as any)).toBe('ctx-test-table-select');
  });
});
