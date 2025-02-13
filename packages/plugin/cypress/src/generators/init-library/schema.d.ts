export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  skipFormat?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  /** Whether to setup cypress component testing */
  component?: boolean;
  /** Whether to generate tests for the components */
  generateTests?: boolean;
  /** A build target used to configure Cypress component testing in the format of `project:target[:configuration]`. The build target should be an angular app. If not provided we will try to infer it from your projects usage. */
  buildTarget?: string;
}
