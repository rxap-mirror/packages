import { NormalizeRouteComponent, NormalizeRouteComponentList } from './route-component';

jest.mock('./component-options', () => ({
  NormalizeComponentOptions: jest.fn((o) => ({ ...o, name: o.name || 'test' })),
}));

describe('NormalizeRouteComponent', () => {
  it('should normalize route component', () => {
    const input = { name: 'home', path: 'home' };
    const result = NormalizeRouteComponent(input as any);
    expect(result.path).toBe('home');
    expect(result.selector).toBe(false);
  });

  it('should default path to name', () => {
    const result = NormalizeRouteComponent({ name: 'about' } as any);
    expect(result.path).toBe('about');
  });

  it('should normalize children', () => {
    const input = { name: 'root', children: [{ name: 'child' }] };
    const result = NormalizeRouteComponent(input as any);
    expect(result.children).toHaveLength(1);
  });

  it('should normalize list', () => {
    const result = NormalizeRouteComponentList([{ name: 'a' }, { name: 'b' }]);
    expect(result).toHaveLength(2);
  });
});
