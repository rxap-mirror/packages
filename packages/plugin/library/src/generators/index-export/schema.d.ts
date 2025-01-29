export interface IndexExportGeneratorSchema {
  project?: string;
  projects?: string[];
  generateRootExport?: boolean;
  additionalEntryPoints?: string[];
}
