import { PrintGeneralOptions } from '@rxap/schematics-utilities';
import { NormalizedAngularOptions } from './angular-options';
import { BackendTypes } from './backend/backend-types';

export function PrintAngularOptions(schematicName: string, options: NormalizedAngularOptions) {
  PrintGeneralOptions(schematicName, options);
  const {
    name,
    context,
    nestModule,
    controllerName,
    backend,
    directory,
    componentName,
  } = options;

  if (name) {
    console.log(`\x1b[33m===== Name: ${ name }\x1b[0m`);
  }
  if (componentName) {
    console.log(`\x1b[33m===== Component Name: ${ componentName }\x1b[0m`);
  }
  if (directory) {
    console.log(`\x1b[90m===== Directory: ${ directory }\x1b[0m`);
  }
  if (context) {
    console.log(`\x1b[34m===== Context: ${ context }\x1b[0m`);
  } else {
    console.log(`\x1b[34m===== Context: \x1b[31mNONE\x1b[0m`);
  }
  switch (backend.kind) {

    case BackendTypes.NESTJS:
      console.log(`\x1b[31m===== Backend: NESTJS\x1b[0m`);
      if (nestModule) {
        console.log(`\x1b[36m===== Nest Module: ${ nestModule }\x1b[0m`);
      } else {
        console.log(`\x1b[36m===== Nest Module: \x1b[31mNONE\x1b[0m`);
      }
      if (controllerName) {
        console.log(`\x1b[36m===== Controller Name: ${ controllerName }\x1b[0m`);
      } else {
        console.log(`\x1b[36m===== Controller Name: \x1b[31mNONE\x1b[0m`);
      }
      break;

    case BackendTypes.OPEN_API:
      console.log(`\x1b[31m===== Backend: OPENAPI\x1b[0m`);
      break;

    case BackendTypes.LOCAL:
      console.log(`\x1b[31m===== Backend: LOCAL\x1b[0m`);
      break;

    case BackendTypes.NONE:
      console.log(`\x1b[31m===== Backend: NONE\x1b[0m`);
      break;

    default:
      console.log(`\x1b[31m===== Backend: ${ backend.kind.toUpperCase() }\x1b[0m`);
      break;

  }

}