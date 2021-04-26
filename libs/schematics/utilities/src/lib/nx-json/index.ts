export interface NxJson {
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
