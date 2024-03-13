import { CreateProject } from '@rxap/ts-morph';
import { Project } from 'ts-morph';
import { CoerceAppNavigation } from './coerce-app-navigation';

describe('CoerceAppNavigation', () => {

  let project: Project;

  beforeEach(() => {
    project = CreateProject();
  });

  it('should coerce app navigation', () => {

    const sourceFile = project.createSourceFile('app-navigation.ts');

    CoerceAppNavigation(sourceFile);

    expect(sourceFile.getText()).toEqual(`import { NavigationWithInserts, RXAP_NAVIGATION_CONFIG } from '@rxap/layout';

export const APP_NAVIGATION: () => NavigationWithInserts = () => [];
export const APP_NAVIGATION_PROVIDER = {
    provide: RXAP_NAVIGATION_CONFIG,
    useValue: APP_NAVIGATION
  };
`);

  });

  it('should be run multiple times', () => {

    const sourceFile = project.createSourceFile('app-navigation.ts');

    CoerceAppNavigation(sourceFile);
    CoerceAppNavigation(sourceFile);
    CoerceAppNavigation(sourceFile);

    expect(sourceFile.getText()).toEqual(`import { NavigationWithInserts, RXAP_NAVIGATION_CONFIG } from '@rxap/layout';

export const APP_NAVIGATION: () => NavigationWithInserts = () => [];
export const APP_NAVIGATION_PROVIDER = {
    provide: RXAP_NAVIGATION_CONFIG,
    useValue: APP_NAVIGATION
  };
`);

  });

  it('should coerce app navigation with items', () => {

    const sourceFile = project.createSourceFile('app-navigation.ts');

    CoerceAppNavigation(sourceFile, {
      itemList: [
        {
          routerLink: [ 'home' ],
          label: 'Home'
        }
      ]
    });

    expect(sourceFile.getText()).toEqual(`import { NavigationWithInserts, RXAP_NAVIGATION_CONFIG } from '@rxap/layout';

export const APP_NAVIGATION: () => NavigationWithInserts = () => [{
    routerLink: ['home'],
    label: 'Home'
  }];
export const APP_NAVIGATION_PROVIDER = {
    provide: RXAP_NAVIGATION_CONFIG,
    useValue: APP_NAVIGATION
  };
`);

  });

  it('should coerce app navigation with items that already exists', () => {

    const sourceFile = project.createSourceFile('app-navigation.ts');

    CoerceAppNavigation(sourceFile, {
      itemList: [
        {
          routerLink: [ 'home' ],
          label: 'Home'
        }
      ]
    });
    CoerceAppNavigation(sourceFile, {
      itemList: [
        {
          routerLink: [ 'home' ],
          label: 'Home'
        }
      ]
    });

    expect(sourceFile.getText()).toEqual(`import { NavigationWithInserts, RXAP_NAVIGATION_CONFIG } from '@rxap/layout';

export const APP_NAVIGATION: () => NavigationWithInserts = () => [{
    routerLink: ['home'],
    label: 'Home'
  }];
export const APP_NAVIGATION_PROVIDER = {
    provide: RXAP_NAVIGATION_CONFIG,
    useValue: APP_NAVIGATION
  };
`);

  });

});
