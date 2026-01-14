import { ControlToDtoClassProperty } from './control-to-dto-class-property';

describe('ControlToDtoClassProperty', () => {
  it('should map control to dto class property', () => {
    const control = {
      name: 'test',
      type: 'string',
      isRequired: true,
      isArray: false,
      source: 'src'
    };
    const result = ControlToDtoClassProperty(control as any);

    expect(result).toEqual({
      name: 'test',
      type: 'string',
      isOptional: false,
      isArray: false,
      source: 'src'
    });
  });

  it('should set isOptional to true if isRequired is false', () => {
    const control = { name: 'test', isRequired: false };
    const result = ControlToDtoClassProperty(control as any);
    expect(result.isOptional).toBe(true);
  });
});
