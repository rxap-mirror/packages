import { FormWindowRef } from './form-window-ref';

describe('FormWindowRef', () => {
  const windowRef = { close: vi.fn() } as any;
  const ref = new FormWindowRef({} as any, windowRef);

  it('is not yet implemented for submit and reset', () => {
    expect(() => ref.submit()).toThrow('Not yet implemented!');
    expect(() => ref.reset()).toThrow('Not yet implemented!');
  });

  it('closes the window ref', () => {
    ref.close('x');
    expect(windowRef.close).toHaveBeenCalledWith('x');
  });
});
