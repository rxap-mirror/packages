import { NormalizeRouteComponentOptions } from './normalize-route-component-options';
import { RouteComponentOptions } from './schema';

describe('NormalizeRouteComponentOptions', () => {
  it('should normalize minimal route component options', () => {
    const options: RouteComponentOptions = {
      name: 'test-route',
      project: 'ui-lib',
    };
    expect(NormalizeRouteComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex route component options', () => {
    const options: RouteComponentOptions = {
      name: 'dashboard',
      project: 'ui-lib',
      path: '/dashboard',
      outlet: 'primary',
      data: { title: 'Dashboard' },
      children: [
        {
          name: 'stats',
          path: 'stats',
        },
      ],
    };
    expect(NormalizeRouteComponentOptions(options)).toMatchSnapshot();
  });
});
