export interface InitGeneratorSchema {
  /** The name of the shared styleguide host application project. */
  prismProject?: string;
  /** Whether to skip formatting generated files */
  skipFormat?: boolean;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
}
