export interface RunGeneratorExecutorSchema {
  verbose?: boolean;
  generator: string;
  options?: Record<string, unknown>;
  withoutProjectArgument?: boolean;
  dryRun?: boolean;
}
