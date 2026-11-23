import { ToDisplayPipe } from './to-display.pipe';

describe('ToDisplayPipe', () => {
  it('create an instance', () => {
    const pipe = new ToDisplayPipe();
    expect(pipe).toBeTruthy();
  });

  it('should format the value as json by default', () => {
    expect(new ToDisplayPipe().transform({ a: 1 })).toBe(JSON.stringify({ a: 1 }, null, 2));
  });

  it('should use the custom display function', () => {
    const toDisplay = vi.fn((value: any) => `<${ value.name }>`);
    expect(new ToDisplayPipe().transform({ name: 'x' }, toDisplay)).toBe('<x>');
    expect(toDisplay).toHaveBeenCalledWith({ name: 'x' });
  });
});
