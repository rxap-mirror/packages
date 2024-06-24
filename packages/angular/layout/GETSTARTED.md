## Layout

Create a new file `layout.routes.ts` in the `app` folder. This file will contain all child routes that should be loaded within the layout component.

```typescript
import { LayoutComponent } from '@rxap/layout';

const ROUTES: Route[] = [
  {
    path: '',
    component: LayoutComponent,
    children: [ ]
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
      ProvideNavigationConfig(APP_NAVIGATION, withNavigationService()),
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

...

### User Profile

The user profile icon is displaed

