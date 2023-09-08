import { faker } from '@faker-js/faker';
import {
  NavigationWithInserts,
  RXAP_NAVIGATION_CONFIG,
} from '@rxap/layout';
import { dasherize } from '@rxap/utilities';

export const APP_NAVIGATION: () => NavigationWithInserts = () => [
  {
    routerLink: [ '/', 'table' ],
    icon: { icon: 'table_rows' },
    label: $localize`Table`,
    children: [
      {
        routerLink: [ '/', 'table', 'action' ],
        label: $localize`Action`,
        icon: { icon: 'task_alt' },
      },
      {
        routerLink: [ '/', 'table', 'testing' ],
        label: $localize`Testing`,
        icon: { icon: 'task_alt' },
      },
      {
        routerLink: [ '/', 'table', 'filter' ],
        label: $localize`Filter`,
        icon: { icon: 'filter_alt' },
      },
      {
        routerLink: [ '/', 'table', 'header-button' ],
        label: $localize`Header Button`,
        icon: { icon: 'check_box' },
      },
      {
        routerLink: [ '/', 'table', 'maximum-tree' ],
        label: $localize`Maximum Tree`,
        icon: { icon: 'account_tree' },
      },
      {
        routerLink: [ '/', 'table', 'minimum' ],
        label: $localize`Minimum`,
        icon: { icon: 'text_decrease' },
      },
    ],
  },
  {
    routerLink: [ '/', 'accordion' ],
    icon: { icon: 'format_list_bulleted' },
    label: $localize`Accordion`,
    children: [
      {
        routerLink: [ '/', 'accordion', 'simple' ],
        icon: { icon: 'flag' },
        label: $localize`Simple`,
      },
      {
        routerLink: [ '/', 'accordion', 'multiple' ],
        icon: { icon: 'filter_none' },
        label: $localize`Multiple`,
      },
      {
        routerLink: [ '/', 'accordion', 'complex' ],
        icon: { icon: 'memory' },
        label: $localize`complex`,
      },
    ],
  },
  {
    routerLink: [ '/', 'form' ],
    icon: { icon: 'feed' },
    label: $localize`Form`,
  },
  {
    routerLink: [ '/', 'form-controls' ],
    icon: { icon: 'toggle_off' },
    label: $localize`Form Controls`,
  },
  {
    routerLink: [ '/', 'error' ],
    icon: { icon: 'error' },
    label: $localize`Error`,
    children: [
      {
        routerLink: [ '/', 'error', 'http' ],
        icon: { icon: 'http' },
        label: $localize`Http`,
      },
      {
        routerLink: [ '/', 'error', 'angular' ],
        icon: { icon: 'angular' },
        label: $localize`Angular`,
      },
    ],
  },
  ...Array.from({ length: 10 }).map(() => {
    const name = faker.company.name();
    return {
      routerLink: [ '/', 'fake', dasherize(name) ],
      label: name,
      icon: { icon: 'business' },
      children: Array.from({ length: 5 }).map(() => {
        const productName = faker.commerce.productName();
        return {
          routerLink: [ '/', 'fake', dasherize(name), dasherize(productName) ],
          icon: { icon: 'inventory' },
          label: productName,
          children: Array.from({ length: 3 }).map(() => {
            const material = faker.commerce.productMaterial();
            return {
              routerLink: [ '/', 'fake', dasherize(name), dasherize(productName), dasherize(material) ],
              icon: { icon: 'category' },
              label: material,
            };
          }),
        };
      }),
    };
  }),
];

export const APP_NAVIGATION_PROVIDER = {
  provide: RXAP_NAVIGATION_CONFIG,
  useValue: APP_NAVIGATION,
};
