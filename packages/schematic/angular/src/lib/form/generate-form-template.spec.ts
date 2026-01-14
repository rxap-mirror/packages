import { GenerateFormTemplate } from './generate-form-template';

describe('GenerateFormTemplate', () => {
  it('should generate template from controls', () => {
    const controls = [
      { handlebars: jest.fn(({ control }) => `<div>${control.name}</div>`), name: 'c1' },
      { handlebars: jest.fn(({ control }) => `<span>${control.name}</span>`), name: 'c2' },
    ];
    const result = GenerateFormTemplate({ controlList: controls as any });

    expect(result).toBe('<div>c1</div><span>c2</span>');
    expect(controls[0].handlebars).toHaveBeenCalledWith({ control: controls[0] });
    expect(controls[1].handlebars).toHaveBeenCalledWith({ control: controls[1] });
  });

  it('should return empty string for no controls', () => {
    expect(GenerateFormTemplate({ controlList: [] })).toBe('');
  });
});
