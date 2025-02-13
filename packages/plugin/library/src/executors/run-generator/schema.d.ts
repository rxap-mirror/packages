export interface RunGeneratorExecutorSchema {
  /** Name of the generate to execute */
  generator?: string;
  /** Options to pass to the generator */
  options?: Record<string, unknown>;
  /** If true, the project argument will not be passed to the generator */
  withoutProjectArgument?: boolean;
  /** If true, the generator will be executed in dry run mode */
  dryRun?: boolean;
  /** If true, the generator will be executed in verbose mode */
  verbose?: boolean;
}
