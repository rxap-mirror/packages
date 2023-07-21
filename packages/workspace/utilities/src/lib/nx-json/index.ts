export interface NxJson {
  targetDefaults?: Record<string, {
    inputs?: string[];
    dependsOn?: Array<string | { target: string, projects?: string }>
  }>;
  npmScope: string;
  implicitDependencies: Record<string, string>;
  projects: Record<string, {
    tags: string[];
    implicitDependencies: string[];
  }>;
  affected: {
    defaultBase: string;
  };
  tasksRunnerOptions: Record<string, {
    runner: string;
    options: Record<string, any>;
  }>;
}
