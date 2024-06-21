export interface ProjectTargetGeneratorSchema {
  projects?: string[];
  project?: string;
  overwrite?: boolean;
  cleanup?: boolean;
  simplify?: boolean;
  reorder?: boolean;
}
