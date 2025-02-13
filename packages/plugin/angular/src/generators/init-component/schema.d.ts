export enum InitComponentViewEncapsulationGeneratorSchemaEnum {
  EMULATED = 'Emulated',
  NONE = 'None',
  SHADOW_DOM = 'ShadowDom'
}

export enum InitComponentChangeDetectionGeneratorSchemaEnum {
  DEFAULT = 'Default',
  ON_PUSH = 'OnPush'
}

export enum InitComponentStyleGeneratorSchemaEnum {
  CSS = 'css',
  SCSS = 'scss',
  SASS = 'sass',
  LESS = 'less',
  NONE = 'none'
}

export interface InitComponentGeneratorSchema {
  /** The directory at which to create the component file, relative to the current workspace. Default is a folder with the same name as the component in the project root. */
  directory?: string;
  /** The name of the feature. */
  feature?: string;
  /** The name of the project. */
  project: string;
  /** The name of the component. */
  name: string;
  /** The prefix to apply to the generated component selector. */
  prefix?: string;
  /** Specifies if the style will contain `:host { display: block; }`. */
  displayBlock?: boolean;
  /** Include styles inline in the component.ts file. Only CSS styles can be included inline. By default, an external styles file is created and referenced in the component.ts file. */
  inlineStyle?: boolean;
  /** Include template inline in the component.ts file. By default, an external template file is created and referenced in the component.ts file. */
  inlineTemplate?: boolean;
  /** Whether the generated component is standalone. _Note: This is only supported in Angular versions >= 14.1.0_. */
  standalone?: boolean;
  /** The view encapsulation strategy to use in the new component. */
  viewEncapsulation?: InitComponentViewEncapsulationGeneratorSchemaEnum;
  /** The change detection strategy to use in the new component. */
  changeDetection?: InitComponentChangeDetectionGeneratorSchemaEnum;
  /** The filename or path to the NgModule that will declare this component. */
  module?: string;
  /** The file extension or preprocessor to use for style files, or `none` to skip generating the style file. */
  style?: InitComponentStyleGeneratorSchemaEnum;
  /** Do not create `spec.ts` test files for the new component. */
  skipTests?: boolean;
  /** Create the new files at the top level of the current project. */
  flat?: boolean;
  /** Do not import this component into the owning NgModule. */
  skipImport?: boolean;
  /** The HTML selector to use for this component. */
  selector?: string;
  /** Specifies if the component should have a selector or not. */
  skipSelector?: boolean;
  /** Adds a developer-defined type to the filename, in the format `name.type.ts`. */
  type?: string;
  /** Specifies if the component should be the default export of file. */
  defaultExport?: boolean;
  /** Specifies if the component should be exported in the declaring `NgModule`. Additionally, if the project is a library, the component will be exported from the project's entry point (normally `index.ts`) if the module it belongs to is also exported or if the component is standalone. */
  export?: boolean;
  /** Skip formatting files. */
  skipFormat?: boolean;
  /** Set up Storybook interaction tests. */
  interactionTests?: boolean;
  /** The Cypress project to generate the stories under. By default, inferred from `projectName`. */
  cypressProject?: string;
  /** Directory where to place the generated spec file. By default matches the value of the `componentPath` option. */
  specDirectory?: string;
}
