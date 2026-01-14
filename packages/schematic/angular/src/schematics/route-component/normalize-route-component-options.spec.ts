import {
  NormalizeAngularOptions,
  NormalizeRouteComponent,
} from '@rxap/schematic-angular';
import { NormalizeRouteComponentOptions } from './normalize-route-component-options';

jest.mock('@rxap/schematic-angular', () => ({
  NormalizeAngularOptions: jest.fn((o) => ({ ...o, name: 'test' })),
  NormalizeRouteComponent: jest.fn((o) => ({ ...o, path: 'test' })),
}));

describe('NormalizeRouteComponentOptions', () => {
  it('should normalize route component options', () => {
    const options = { };
    const result = NormalizeRouteComponentOptions(options as any);

    expect(NormalizeAngularOptions).toHaveBeenCalledWith(options);
    expect(NormalizeRouteComponent).toHaveBeenCalledWith(options);
    expect(result.name).toBe('test');
    expect(result.path).toBe('test');
  });
});
