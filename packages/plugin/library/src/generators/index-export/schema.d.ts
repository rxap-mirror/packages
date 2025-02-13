export interface IndexExportGeneratorSchema {
  projects?: Array<string>;
  project?: string;
  /** Generate index.ts in the source root of the project */
  generateRootExport?: boolean;
  additionalEntryPoints?: Array<string>;
}
