# Component Testing

## How to configure the project

To configurte a nx project to be able to use cypress component test the following generator should be used:

```bash
nx g @nx/angular:cypress-component-configuration \
  --project=autocomplete-table-select \
  --buildTarget=settings:build \
  --generateTests=true
```

The `buildTarget` should be a frontend project. For example the main angular frontend application of the mono repo.

Depending on the project some changes are required to properly integrate the cypress component test execution with the
reset of the mono repo.

## cypress.config.ts

Instead of using the nx preset for the component test use the custom preset of the mono repo. As an example the custom
preset `componentTestingPreset` imported from `workspace` could be used.

```typescript
import { defineConfig } from 'cypress';
import { componentTestingPreset } from 'workspace';

export default defineConfig({
  component: componentTestingPreset(__filename),
});
```

## cypress/commands.ts

To use all the utility commands and configruations from the workspace, the import of the workspace commands and support
file is required.

```typescript
import 'workspace/commands';
import 'workspace/support';
```

## project.json

To simplify the development of the component test the configuration `open` should be added to the target `component-test`

```json
{
  "component-test": {
    "executor": "@nx/cypress:cypress",
    "options": {
      "cypressConfig": "libs/autocomplete-table-select/cypress.config.ts",
      "testingType": "component",
      "skipServe": true,
      "devServerTarget": "settings:build"
    },
    "configurations": {
      "open": {
        "watch": true
      }
    }
  }
}
```
