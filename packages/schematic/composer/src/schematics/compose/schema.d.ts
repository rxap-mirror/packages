export interface ComposeSchematicSchema {
  project?: string;
  feature?: string;
  replace?: boolean;
  overwrite?: boolean | string[] | string;
  filter?: string;
}
