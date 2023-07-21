import {
  SchematicsException,
  Tree,
} from '@angular-devkit/schematics';
import { HasTableComponent } from '@rxap/schematics-ts-morph';

export interface AssertTableComponentExistsOptions {
  project: string;
  feature: string | null;
  directory: string | null;
  tableName: string;
}

export function AssertTableComponentExists(host: Tree, options: AssertTableComponentExistsOptions) {
  const {
    tableName,
    project,
    feature,
    directory,
  } = options;
  if (
    !HasTableComponent(host, {
      project,
      feature,
      directory,
      name: tableName,
    })
  ) {
    throw new SchematicsException(
      `Could not find the table component '${ tableName }' in the project '${ project }' and feature '${ feature }' and directory '${ directory }'.`,
    );
  }
}
