import {
  CoerceInclude,
  Include,
} from './coerce-include';

describe('CoerceInclude', () => {

  describe('component', () => {

    it('should add component include if not exists', () => {

      const includeList: Include[] = [];
      const coerceInclude: Include = {
        component: 'test@1.0.0',
      };
      CoerceInclude(includeList, coerceInclude);
      expect(includeList).toEqual([ coerceInclude ]);

    });

    it('should not add component include if exists', () => {

      const includeList: Include[] = [
        {
          component: 'test@1.0.0',
        },
      ];
      const coerceInclude: Include = {
        component: 'test@1.0.0',
      };
      CoerceInclude(includeList, coerceInclude);
      expect(includeList).toEqual([
        {
          component: 'test@1.0.0',
        },
      ]);

    });

    it('should not add component include if exists with different version', () => {

      const currentInclude: Include = {
        component: 'gitlab.com/rxap/gitlab-ci/nx-workspace@6.2.0-edge.12',
      };
      const includeList: Include[] = [ currentInclude ];
      const coerceInclude: Include = {
        component: 'gitlab.com/rxap/gitlab-ci/nx-workspace@~latest',
      };
      CoerceInclude(includeList, coerceInclude);
      expect(includeList).toEqual([
        {
          component: 'gitlab.com/rxap/gitlab-ci/nx-workspace@6.2.0-edge.12',
        },
      ]);
    });

    it('should update component include if has changed rules', () => {
      const currentInclude: Include = {
        component: 'gitlab.com/rxap/gitlab-ci/nx-workspace@6.2.0-edge.12',
      };
      const includeList: Include[] = [ currentInclude ];
      const coerceInclude: Include = {
        component: 'gitlab.com/rxap/gitlab-ci/nx-workspace@~latest',
        rules: [
          {
            if: '$RELEASE_IT != "true"'
          }
        ]
      };
      CoerceInclude(includeList, coerceInclude);
      expect(includeList).toEqual([
        {
          component: 'gitlab.com/rxap/gitlab-ci/nx-workspace@6.2.0-edge.12',
          rules: [
            {
              if: '$RELEASE_IT != "true"'
            }
          ]
        },
      ]);
    });


  });

});
