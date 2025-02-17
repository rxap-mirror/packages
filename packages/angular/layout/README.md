This library provides a set of Angular components and services for creating consistent and configurable application layouts, including headers, footers, side navigation, and content areas. It offers features such as dynamic navigation, external application integration, and customizable themes. The library also includes directives for extending header and footer areas with custom content.

[![npm version](https://img.shields.io/npm/v/@rxap/layout?style=flat-square)](https://www.npmjs.com/package/@rxap/layout)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/layout)
![npm](https://img.shields.io/npm/dm/@rxap/layout)
![NPM](https://img.shields.io/npm/l/@rxap/layout)

- [Installation](#installation)
- [Get started](#get-started)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/layout
```
**Install peer dependencies:**
```bash
yarn add @angular/animations@^19.1.3 @angular/cdk@^19.1.1 @angular/common@^19.1.3 @angular/core@^19.1.3 @angular/material@^19.1.1 @angular/router@^19.1.3 @rxap/browser-utilities@^1.1.10 @rxap/config@^19.0.1 @rxap/data-source@^19.0.1 @rxap/environment@^19.0.1 @rxap/material-directives@^19.0.1 @rxap/ngx-pub-sub@^19.0.1 @rxap/ngx-theme@^19.0.1 @rxap/pattern@^1.1.11 @rxap/utilities@^16.4.2 rxjs@^7.8.1 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/layout:init
```
# Get started

## Layout

Create a new file `layout.routes.ts` in the `app` folder. This file will contain all child routes that should be loaded within the layout component.

```typescript
import { LayoutComponent, provideLayout } from '@rxap/layout';

const ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [ ],
    providers: [ provideLayout() ],
  },
];
```

Import the layout routes into the `app.routes.ts` file.

```typescript
export const appRoutes: Route[] = [
  {
    path: '',
    loadChildren: () => import('./layout.routes'),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
```

## Navigation

Create a new file `app.navigation.ts` in the `app` folder. This file will contain the navigation items that should be displayed in the layout component.

```typescript
export const APP_NAVIGATION: () => NavigationWithInserts = () => [];
```

Provide the app navigation in the layout routes:

```typescript
import {
  LayoutComponent,
  ProvideNavigationConfig,
  withNavigationService,
} from '@rxap/layout';
import { APP_NAVIGATION } from './app.navigation';

const ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [ ],
    providers: [
      provideLayout(
        withNavigationConfig(APP_NAVIGATION),
      ),
    ],
  },
];
```

### Navigation Item

A navigation item represents a single item in the navigation sidebar. Each item has the required properties `label` and `routerLink`. The `label` property is the text that should be displayed in the sidebar. The `routerLink` property is the path that should be navigated to when the item is clicked.

```typescript
const item: NavigationItem = {
  label: 'Home',
  routerLink: '/',
};
```

With the `children` property, a navigation item can have child items. The child items are displayed in a dropdown menu when the parent item is clicked.

```typescript
const item: NavigationItem = {
  label: 'Home',
  routerLink: '/',
  children: [
    {
      label: 'Child',
      routerLink: '/child',
    },
  ],
};
```

#### Icon Property

With the `icon` property, the item can be assigned an icon. The icon is displayed to the left of the label. If the navigation sidebar is collapsed, only the icon is displayed.

```typescript
const item: NavigationItem = {
  label: 'Home',
  routerLink: '/',
  icon: { icon: 'home' },
};
```

#### Status Property

With the `status` property, a injectable token, class or function can be assigned to the item. The object must have the method `isVisible` which returns a boolean. If the method returns `false`, the item is not displayed in the navigation sidebar.

```typescript
@Injectable()
class SetNavStatus {
  isVisible(item: NavigationItem): boolean {
    return false;
  }
}

const item: NavigationItem = {
  label: 'Home',
  routerLink: '/',
  status: SetNavStatus,
};
```

### Navigation Divider Item

A navigation divider item is a horizontal line that separates navigation items. It is used to group items in the navigation sidebar. It is required to set the property `divider` to `true`. With the optional property `title`, a title can be defined that is displayed below the divider.

```typescript
const item: NavigationDividerItem = {
  divider: true,
  title: 'Group',
};
```

### Navigation Insert Item (WIP)

A navigation insert item is a placeholder for a navigation item that should be inserted into the navigation sidebar. 
The item is used to define where a dynamic navigation should be inserted. The `insert` property is the key that is used 
identify the insert item. The `insert` property is required.

```typescript
const item: NavigationInsertItem = {
  insert: 'insert-key',
};
```

## Header

The header is composed of the components from left to right: AppsButtonComponent, SettingsButtonComponent and UserProfileIconComponent.

### Apps Button

The apps buttons allow for a navigation between different applications. To configure the apps button, the config path 
`navigation.apps` must be set with an array of object with the property `title` and ether `routerLink` or `href`. If the
property `href` is set, the link is opened in a new tab. If the property `routerLink` the router is used to navigate.

```json
{
  "navigation": {
    "apps": [
      {
        "title": "App 1",
        "routerLink": ["/", "app1"]
      },
      {
        "title": "App 2",
        "href": "https://app2.com"
      }
    ]
  }
}
```

> If the application is in production mode, the current `localId` is appended to the url defined in the `href` property.

### Settings Button Customization (WIP)

It is possible to add custom items to the settings menu. This custom item can be a component or a configuration object.

> 

#### Configuration Object

The action function is called when the item is clicked. It is possible to use the `inject` function to inject services.

```typescript
import {
  LayoutComponent,
  ProvideNavigationConfig,
  withNavigationService,
} from '@rxap/layout';
import { APP_NAVIGATION } from './app.navigation';

const ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [ ],
    providers: [
      provideLayout(
        withNavigationConfig(APP_NAVIGATION),
        withSettingsMenuItems(
          {
            label: 'Custom Item',
            icon: { icon: 'home' },
            action: () => inject(MatDialog).open(MyCustomDialogComponent),
          }
        )
      ),
    ],
  },
];
```

#### Component

If a component is provided ensure the component template uses the `mat-menu-item` component:

```angular17html
<button mat-menu-item>My Custom Item</button>
```

```typescript
import {
  LayoutComponent,
  ProvideNavigationConfig,
  withNavigationService,
} from '@rxap/layout';
import { APP_NAVIGATION } from './app.navigation';

const ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [ ],
    providers: [
      provideLayout(
        withNavigationConfig(APP_NAVIGATION),
        withSettingsMenuItems(
          MyCustomMenuItemComponent
        )
      ),
    ],
  },
];
```

### User Profile (WIP)

...

## Dynamic Footer

With the directive `rxapFooter` it is possible to define a dynamic footer. When the directive is used on a `<ng-template>` in a component,
that is rendered in the layout component, the template is rendered in the footer of the layout component.

```angular17html
<mat-card>
  ...
</mat-card>
<ng-template rxapFooter>
  <button mat-button>A button in the layout footer</button>
</ng-template>
```

# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/layout:init
```
