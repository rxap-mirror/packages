export interface ComposeSchematicSchema {
  project?: string;
  feature?: string;
  replace?: boolean;
  overwrite?: boolean | string[];
  filter?: string;
}
