export enum CoerceProjectNameAndRootFormatGeneratorSchemaEnum {
  AS_PROVIDED = 'as-provided',
  DERIVED = 'derived'
}

export enum CoerceUnitTestRunnerGeneratorSchemaEnum {
  JEST = 'jest',
  NONE = 'none'
}

export enum CoerceLinterGeneratorSchemaEnum {
  ESLINT = 'eslint',
  NONE = 'none'
}

export enum CoerceCompilationModeGeneratorSchemaEnum {
  FULL = 'full',
  PARTIAL = 'partial'
}

export enum CoerceViewEncapsulationGeneratorSchemaEnum {
  EMULATED = 'Emulated',
  NONE = 'None',
  SHADOW_DOM = 'ShadowDom'
}

export enum CoerceChangeDetectionGeneratorSchemaEnum {
  DEFAULT = 'Default',
  ON_PUSH = 'OnPush'
}

export enum CoerceStyleGeneratorSchemaEnum {
  CSS = 'css',
  SCSS = 'scss',
  SASS = 'sass',
  LESS = 'less',
  NONE = 'none'
}

export interface InitLibraryGeneratorSchema {
  project?: string;
  projects?: Array<string>;
  /** Whether to overwrite existing files */
  overwrite?: boolean;
  /** Whether to skip executing project specific initialization */
  skipProjects?: boolean;
  skipFormat?: boolean;
  /** Whether to add the index-export target to the library */
  indexExport?: boolean;
  coerce?: boolean | {
      /** A directory where the library is placed. */
      directory?: string;
      /** Whether to generate the project name and root directory as provided (`as-provided`) or generate them composing their values and taking the configured layout into account (`derived`). */
      projectNameAndRootFormat?: CoerceProjectNameAndRootFormatGeneratorSchemaEnum;
      /** Generate a publishable library. */
      publishable?: boolean;
      /** Generate a buildable library. */
      buildable?: boolean;
      /** The prefix to apply to generated selectors. */
      prefix?: string;
      /** Skip formatting files. */
      skipFormat?: boolean;
      /** Don't include the directory in the name of the module or standalone component entry of the library. */
      simpleName?: boolean;
      /** Add a module spec file. */
      addModuleSpec?: boolean;
      /** Do not add dependencies to `package.json`. */
      skipPackageJson?: boolean;
      /** Do not update `tsconfig.json` for development experience. */
      skipTsConfig?: boolean;
      /** Add router configuration. See `lazy` for more information. */
      routing?: boolean;
      /** Add `RouterModule.forChild` when set to true, and a simple array of routes when set to false. */
      lazy?: boolean;
      /** Path to the parent route configuration using `loadChildren` or `children`, depending on what `lazy` is set to. */
      parent?: string;
      /** Add tags to the library (used for linting). */
      tags?: string;
      /** Test runner to use for unit tests. */
      unitTestRunner?: CoerceUnitTestRunnerGeneratorSchemaEnum;
      /** The library name used to import it, like `@myorg/my-awesome-lib`. Must be a valid npm name. */
      importPath?: string;
      /** Create a library with stricter type checking and build optimization options. */
      strict?: boolean;
      /** The tool to use for running lint checks. */
      linter?: CoerceLinterGeneratorSchemaEnum;
      /** Split the project configuration into `<projectRoot>/project.json` rather than including it inside `workspace.json`. */
      standaloneConfig?: boolean;
      /** Specifies the compilation mode to use. If not specified, it will default to `partial` for publishable libraries and to `full` for buildable libraries. The `full` value can not be used for publishable libraries. */
      compilationMode?: CoerceCompilationModeGeneratorSchemaEnum;
      /** Whether or not to configure the ESLint `parserOptions.project` option. We do not do this by default for lint performance reasons. */
      setParserOptionsProject?: boolean;
      /** Whether to configure Tailwind CSS for the application. It can only be used with buildable and publishable libraries. Non-buildable libraries will use the application's Tailwind configuration. */
      addTailwind?: boolean;
      /** Whether to skip the creation of a default module when generating the library. */
      skipModule?: boolean;
      /** Generate a library that uses a standalone component instead of a module as the entry point. _Note: This is only supported in Angular versions >= 14.1.0_ */
      standalone?: boolean;
      /** Specifies if the component generated style will contain `:host { display: block; }`. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      displayBlock?: boolean;
      /** Include styles inline in the component.ts file. Only CSS styles can be included inline. By default, an external styles file is created and referenced in the component.ts file. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      inlineStyle?: boolean;
      /** Include template inline in the component.ts file. By default, an external template file is created and referenced in the component.ts file. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      inlineTemplate?: boolean;
      /** The view encapsulation strategy to use in the new component. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      viewEncapsulation?: CoerceViewEncapsulationGeneratorSchemaEnum;
      /** The change detection strategy to use in the new component. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      changeDetection?: CoerceChangeDetectionGeneratorSchemaEnum;
      /** The file extension or preprocessor to use for style files, or `none` to skip generating the style file. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      style?: CoerceStyleGeneratorSchemaEnum;
      /** Do not create `spec.ts` test files for the new component. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      skipTests?: boolean;
      /** The HTML selector to use for this component. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      selector?: string;
      /** Specifies if the component should have a selector or not. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      skipSelector?: boolean;
      /** Ensure the generated standalone component is not placed in a subdirectory. Disclaimer: This option is only valid when `--standalone` is set to `true`. _Note: This is only supported in Angular versions >= 14.1.0_ */
      flat?: boolean;
    };
  targets?: {
      /** If set to false the target fix-dependencies will not be added to the project */
      fixDependencies?: boolean;
      /** If set to false the target index-export will not be added to the project */
      indexExport?: boolean;
    };
}
