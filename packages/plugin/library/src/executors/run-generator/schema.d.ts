export interface RunGeneratorExecutorSchema {
  generator: string;
  options?: Record<string, unknown>;
  withoutProjectArgument?: boolean;
  dryRun?: boolean;
}
