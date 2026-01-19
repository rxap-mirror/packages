Provides an Angular module and directives to manage authorization and permissions in your application. It allows you to control the visibility and enabled state of UI elements based on user permissions. The package includes an &#x60;AuthorizationService&#x60; to check permissions and directives to easily integrate permission checks into your templates and components.

[![npm version](https://img.shields.io/npm/v/@rxap/authorization?style=flat-square)](https://www.npmjs.com/package/@rxap/authorization)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/authorization)
![npm](https://img.shields.io/npm/dm/@rxap/authorization)
![NPM](https://img.shields.io/npm/l/@rxap/authorization)

- [Installation](#installation)
- [Guides](#guides)
- [Generators](#generators)
  - [init](#init)

# Installation

**Add the package to your workspace:**
```bash
yarn add @rxap/authorization
```
**Install peer dependencies:**
```bash
yarn add @angular/core @angular/forms @angular/material @rxap/utilities rxjs 
```
**Execute the init generator:**
```bash
yarn nx g @rxap/authorization:init
```
# Guides

# Authorization Developer Guide

The `@rxap/authorization` package provides a robust and flexible way to manage user permissions in Angular applications. It supports permission-based view rendering, component enabling/disabling, and hierarchical scoping.

## Installation

1.  **Directives**: Import the `HasPermissionModule` in your application or feature module to use the directives in your templates:

    ```typescript
    import { HasPermissionModule } from '@rxap/authorization';

    @NgModule({
      imports: [
        HasPermissionModule,
        // ...
      ],
    })
    export class AppModule {}
    ```

    Alternatively, you can import individual standalone directives as needed (e.g., `IfHasPermissionDirective`, `MatButtonHasEnablePermissionDirective`).

2.  **Providers**: Use the `provideAuthorization()` utility to configure the service and its dependencies (like disabling authorization via config).

    ```typescript
    import { provideAuthorization } from '@rxap/authorization';
    import { ApplicationConfig } from '@angular/core';

    export const appConfig: ApplicationConfig = {
      providers: [
        provideAuthorization(),
        // ... other providers, ensure ConfigService is also provided/available if needed
      ]
    };
    ```

## Authorization Service

The core of the package is the `AuthorizationService`. It holds the current user's permissions and provides methods to check access.

### Setting Permissions

Permissions are stored as a list of strings. You typically set these after user authentication.

```typescript
import { AuthorizationService } from '@rxap/authorization';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private authorizationService: AuthorizationService) {}

  login() {
    // ... authenticate user ...
    const permissions = ['user.read', 'user.write', 'admin.*'];
    this.authorizationService.setPermissions(permissions);
  }
}
```

### Checking Permissions

You can check permissions programmatically using `hasPermission` (sync) or `hasPermission$` (observable).

```typescript
// Synchronous check
if (this.authorizationService.hasPermission('user.create')) {
  // ...
}

// Observable check
this.authorizationService.hasPermission$('user.create').subscribe(canCreate => {
  // ...
});
```

### Permission Logic & Wildcards

The service supports **dot notation** and **wildcards**:
- **Exact Match**: `'user.read'` matches `'user.read'`.
- **Wildcards (`*`)**: The `*` character matches any sequence of characters.
  - `'admin.*'` matches `'admin.settings'`, `'admin.users'`, etc.
  - `'*.read'` matches `'user.read'`, `'product.read'`, etc.
  - `'*'` matches everything (superuser).

## Directives

The package provides several directives to деклараtively control the UI based on permissions.

### Structural Directive: `*rxapIfHasPermission`

Conditionally renders an element if the user has the specified permission.

```html
<div *rxapIfHasPermission="'feature.view'">
  You can see this feature.
</div>

<div *rxapIfHasPermission="'feature.admin'; else accessDenied">
  Admin Panel
</div>

<ng-template #accessDenied>
  <p>Access Denied</p>
</ng-template>
```

### Enable/Disable Directive: `rxapHasEnablePermission`

Disables the host component if the user lacks the permission. This is often better than hiding controls entirely, as it shows what is available.

**Supported Components:**
- Native Buttons (`<button>`)
- Angular Material Buttons (`mat-button`, `mat-raised-button`, `mat-icon-button`, `mat-fab`, etc.)
- Angular Material Input (`matInput`)
- Angular Material Select (`mat-select`)
- Angular Material Checkbox (`mat-checkbox`)
- Angular Material Slide Toggle (`mat-slide-toggle`)
- Reactive Forms Controls (`[formControl]`, `[formControlName]`)

**Usage:**

```html
<!-- Button is disabled without 'user.delete' permission -->
<button mat-button [rxapHasEnablePermission]="'user.delete'" (click)="deleteUser()">
  Delete User
</button>

<!-- Form control is disabled without 'user.edit' permission -->
<input matInput [formControl]="emailCtrl" [rxapHasEnablePermission]="'user.edit'">
```

### Write Permission Directive: `rxapHasWritePermission`

Sets the `readonly` attribute of an element based on permission. Useful for inputs where you want to show the value but prevent editing.

```html
<input [rxapHasWritePermission]="'user.edit'" value="Read-only unless you have permission">
```

## Scopes and Hierarchical Permissions

The package uses a specific concept for scoping permissions, allowing you to reuse components with generic permission checks in different contexts.

### How Scoping Works

Scopes use **slash notation** (`scope/permission`) in the permission list.
- **Identifiers**: The code checks for a simple ID (e.g., `'edit'`).
- **Permissions**: Can be global (e.g., `'admin'`) or scoped (e.g., `'products/edit'`).
- **Context**: A component defines its scope (e.g., `'products'`).

When checking for `'edit'` inside the `'products'` scope:
1. The service looks for permissions starting with `'products/'`.
2. It strips the prefix. `'products/edit'` becomes `'edit'`.
3. It checks if the user has `'edit'`.

Global permissions (without slashes) are always included in the check.

### Using `setAuthorizationScope`

You can define a scope for a component subtree using the `setAuthorizationScope` helper function.

```typescript
import { setAuthorizationScope } from '@rxap/authorization';

@Component({
  selector: 'app-product-list',
  template: `
    <!-- This checks for 'products/create' (mapped to 'create') -->
    <button *rxapIfHasPermission="'create'">Create Product</button>
  `,
  providers: [
    setAuthorizationScope('products'),
  ]
})
export class ProductListComponent {}
```

If the user has the permission `'products/create'`, they will see the button. If they have `'users/create'`, they will not (unless they are also in the `'users'` scope).

### Nested Scopes
You can technically nest scopes by providing dot-separated scopes (e.g., `'admin.users'`), which would look for `'admin.users/permission'`.

## Disabling Authorization for Development

The `provideAuthorization()` function automatically configures the service to check the configuration for `authorization.disabled`.

If you are using `@rxap/config`, you can disable authorization by setting the `authorization.disabled` property to `true` in your configuration file/environment.

```json
{
  "authorization": {
    "disabled": true
  }
}
```

This is useful for local development or testing environments where you want to bypass permission checks.

# Generators

## init
> Initialize the package in the workspace

```bash
nx g @rxap/authorization:init
```
