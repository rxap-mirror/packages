export interface AddMigrationGeneratorSchema {
  project: string;
  name: string;
  packageVersion: string;
  packageJsonUpdates?: boolean;
  description?: string;
}
