import { NormalizeMinimumTableComponentOptions } from './normalize-minimum-table-component-options';

jest.mock('./angular-options', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test', backend: {} })),
  AssertAngularOptionsNameProperty: jest.fn(),
}));
jest.mock('./minimum-table-options', () => ({
  NormalizeMinimumTableOptions: jest.fn((o) => ({ ...o, componentName: 'test-table' })),
}));
jest.mock('@rxap/workspace-utilities', () => ({
  BuildNestControllerName: jest.fn(() => 'TestController'),
}));
jest.mock('path', () => ({ join: jest.fn((...p) => p.join('/')) }));

describe('NormalizeMinimumTableComponentOptions', () => {
  it('should normalize minimum table component options', () => {
    const options = {};
    const isModifier = (v: string): v is any => true;
    const result = NormalizeMinimumTableComponentOptions(options as any, isModifier, '-table');
    expect(result.componentName).toBe('test-table');
    expect(result.controllerName).toBe('TestController');
  });
});
