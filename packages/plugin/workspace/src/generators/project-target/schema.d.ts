export interface ProjectTargetGeneratorSchema {
  projects?: Array<string>;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** remove if empty object for any configuration and the options property. After configuration cleanup */
  cleanup?: boolean;
  /** if the property for the target is equal to the default from the nx.json then remove the property */
  simplify?: boolean;
  /** reorder all target properties to be in alphabetic order */
  reorder?: boolean;
  project?: string;
}
