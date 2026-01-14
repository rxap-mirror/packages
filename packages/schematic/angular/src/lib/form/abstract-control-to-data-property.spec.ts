import { AbstractControlToDataProperty } from './abstract-control-to-data-property';

describe('AbstractControlToDataProperty', () => {
  it('should map control properties to data property', () => {
    const control = {
      name: 'test',
      type: 'string',
      isArray: false,
      isOptional: true,
      source: 'src',
      memberList: []
    };
    const result = AbstractControlToDataProperty(control as any);

    expect(result).toEqual({
      name: 'test',
      type: 'string',
      isArray: false,
      isOptional: true,
      source: 'src',
      memberList: []
    });
  });
});
