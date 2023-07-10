export interface SchematicOptions {
  '@schematics/angular:component'?: {
    /** Specifies the change detection strategy. */
    changeDetection?: 'Default' | 'OnPush';
    /** Specifies if the style will contain `:host { display: block; }`. */
    displayBlock?: boolean;
    /** Specifies if the component is an entry component of declaring module. */
    entryComponent?: boolean;
    /** Specifies if declaring module exports the component. */
    export?: boolean;
    /** Flag to indicate if a directory is created. */
    flat?: boolean;
    /** Specifies if the style will be in the ts file. */
    inlineStyle?: boolean;
    /** Specifies if the template will be in the ts file. */
    inlineTemplate?: boolean;
    /** Allows specification of the declaring module. */
    module?: string;
    /** The prefix to apply to generated selectors. */
    prefix?: string;
    /** The selector to use for the component. */
    selector?: string;
    /** Flag to skip the module import. */
    skipImport?: boolean;
    /** The file extension or preprocessor to use for style files. */
    style?: 'css' | 'scss' | 'sass' | 'less' | 'styl';
    /** Specifies the view encapsulation strategy. */
    viewEncapsulation?: 'Emulated' | 'Native' | 'None' | 'ShadowDom';
    /** Do not create test files. */
    skipTests?: boolean;
  };
  '@schematics/angular:directive'?: {
    /** Specifies if declaring module exports the directive. */
    export?: boolean;
    /** Flag to indicate if a directory is created. */
    flat?: boolean;
    /** Allows specification of the declaring module. */
    module?: string;
    /** The prefix to apply to generated selectors. */
    prefix?: string;
    /** The selector to use for the directive. */
    selector?: string;
    /** Flag to skip the module import. */
    skipImport?: boolean;
    /** Do not create test files. */
    skipTests?: boolean;
  };
  '@schematics/angular:module'?: {
    /** Generates a routing module. */
    routing?: boolean;
    /** The scope for the generated routing. */
    routingScope?: 'Child' | 'Root';
    /** Flag to indicate if a directory is created. */
    flat?: boolean;
    /** Flag to control whether the CommonModule is imported. */
    commonModule?: boolean;
    /** Allows specification of the declaring module. */
    module?: string;
  };
  '@schematics/angular:service'?: {
    /** Flag to indicate if a directory is created. */
    flat?: boolean;
    /** Do not create test files. */
    skipTests?: boolean;
  };
  '@schematics/angular:pipe'?: {
    /** Flag to indicate if a directory is created. */
    flat?: boolean;
    /** Do not create test files. */
    skipTests?: boolean;
    /** Allows for skipping the module import. */
    skipImport?: boolean;
    /** Allows specification of the declaring module. */
    module?: string;
    /** Specifies if declaring module exports the pipe. */
    export?: boolean;
  };
  '@schematics/angular:class'?: {
    /** Do not create test files. */
    skipTests?: boolean;
  };
}
