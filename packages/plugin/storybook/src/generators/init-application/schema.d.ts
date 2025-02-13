export enum InitApplicationLinterGeneratorSchemaEnum {
  ESLINT = 'eslint',
  NONE = 'none'
}

export interface InitApplicationGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  /** Set up Storybook interaction tests. */
  interactionTests?: boolean;
  /** Specifies whether to configure Cypress or not. */
  configureCypress?: boolean;
  /** Specifies whether to automatically generate `*.stories.ts` files for components declared in this project or not. */
  generateStories?: boolean;
  /** Specifies whether to automatically generate test files in the generated Cypress e2e app. */
  generateCypressSpecs?: boolean;
  /** Specifies whether to configure a static file server target for serving storybook. Helpful for speeding up CI build/test times. */
  configureStaticServe?: boolean;
  /** A directory where the Cypress project will be placed. Placed at the root by default. */
  cypressDirectory?: string;
  /** The tool to use for running lint checks. */
  linter?: InitApplicationLinterGeneratorSchemaEnum;
  /** Configure your project with TypeScript. Generate main.ts and preview.ts files, instead of main.js and preview.js. */
  tsConfiguration?: boolean;
  /** Skip formatting files. */
  skipFormat?: boolean;
  /** Paths to ignore when looking for components. */
  ignorePaths?: Array<string>;
  /** Generate documentation using Compodoc. */
  compodoc?: boolean;
}
