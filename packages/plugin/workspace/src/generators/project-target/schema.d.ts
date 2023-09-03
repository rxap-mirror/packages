export interface ProjectTargetGeneratorSchema {
  projects?: string[];
  overwrite?: boolean;
  cleanup?: boolean;
  simplify?: boolean;
  reorder?: boolean;
}
