import { CoerceFormComponentRule } from './coerce-form-component';

jest.mock('@rxap/schematics-ts-morph', () => ({
  CoerceComponentRule: jest.fn((o) => () => {}),
}));
jest.mock('../../../lib/load-handlebars-template', () => ({
  LoadMatFormFieldHandlebarsTemplate: jest.fn(),
  LoadPipeHandlebarsTemplate: jest.fn(),
  LoadCssClassHandlebarsTemplate: jest.fn(),
}));

describe('CoerceFormComponentRule', () => {
  it('should return a rule function', () => {
    const options = { form: { name: 'test', controlList: [] } };
    const rule = CoerceFormComponentRule(options as any);
    expect(typeof rule).toBe('function');
  });
});
