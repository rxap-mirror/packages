import * as api from './index';
import * as angular from './lib/angular';

describe('public api', () => {
  it('exports the rule factories', () => {
    expect(Object.keys(api).length).toBeGreaterThan(20);
    expect(Object.keys(angular).length).toBeGreaterThan(10);
    expect(typeof api.CoerceComponentRule).toBe('function');
    expect(typeof api.CoerceNestController).toBe('function');
  });
});
