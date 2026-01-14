import {
  chain,
  noop,
  Rule,
} from '@angular-devkit/schematics';
import { ExecuteSchematic } from '@rxap/schematics-utilities';
import { NormalizedMinimumTableComponentOptions } from '../normalize-minimum-table-component-options';
import { HeaderButtonKind } from '../table/header-button-kind';

export function headerButtonRule(normalizedOptions: NormalizedMinimumTableComponentOptions): Rule {
  const {
    headerButton,
    project,
    feature,
    backend,
    shared,
    directory,
    context,
    nestModule,
    controllerName,
    componentName,
  } = normalizedOptions;
  if (headerButton) {
    const options = {
      // it is required to use the componentName. The componentName has already the proper suffix '-tree-table'
      // if the name property is used then the wrong suffix '-table' will be used
      tableName: componentName,
      project,
      feature,
      backend,
      shared,
      directory,
      ...headerButton,
    };
    switch (headerButton.kind) {
      case HeaderButtonKind.FORM:
        return chain([
          () => console.log(`Coerce form table header button`),
          ExecuteSchematic('form-table-header-button', {
            ...options,
            context,
            // if the nest module is not defined, then use the controller name as the nest module name
            nestModule: nestModule ?? controllerName,
          }),
        ]);

      case HeaderButtonKind.NAVIGATION:
        return chain([
          () => console.log(`Coerce navigation table header button`),
          ExecuteSchematic('navigation-table-header-button', options),
        ]);

      case HeaderButtonKind.METHOD:
        return chain([
          () => console.log(`Coerce method table header button`),
          ExecuteSchematic('method-table-header-button', options),
        ]);

      default:
        return chain([
          () => console.log('Coerce default table header button'),
          ExecuteSchematic('table-header-button', options),
        ]);
    }
  }
  return noop();
}