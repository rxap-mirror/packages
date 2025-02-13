export enum AddMigrationIncrementGeneratorSchemaEnum {
  MAJOR = 'major',
  MINOR = 'minor',
  PATCH = 'patch'
}

export interface AddMigrationGeneratorSchema {
  /** Name of the project */
  project: string;
  /** Name of the migration */
  name: string;
  /** Description of the migration */
  description?: string;
  /** Version to use for the migration. */
  packageVersion?: string;
  /** Whether or not to include `package.json` updates. */
  packageJsonUpdates?: boolean;
  /** Increment the version of the package.json file */
  increment?: AddMigrationIncrementGeneratorSchemaEnum;
}
