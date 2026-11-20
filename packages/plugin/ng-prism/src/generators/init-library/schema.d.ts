export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** The name of the shared styleguide host application project. */
  prismProject?: string;
  /** The port of the styleguide dev server */
  port?: number;
  /** Whether to skip formatting generated files */
  skipFormat?: boolean;
  /** Whether to overwrite existing targets */
  overwrite?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
}
