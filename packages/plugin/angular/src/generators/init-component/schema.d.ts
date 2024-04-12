export interface InitComponentGeneratorSchema {
  name: string;
  project: string;
  path?: string;
  displayBlock?: boolean;
  inlineStyle?: boolean;
  inlineTemplate?: boolean;
  standalone?: boolean;
  viewEncapsulation?: 'Emulated' | 'None' | 'ShadowDom';
  changeDetection?: 'Default' | 'OnPush';
  style?: 'css' | 'scss' | 'sass' | 'less' | 'none';
  skipTests?: boolean;
  type?: string;
  flat?: boolean;
  skipImport?: boolean;
  selector?: string;
  module?: string;
  skipSelector?: boolean;
  export?: boolean;
  prefix?: string;
  skipFormat?: boolean;
  interactionTests?: boolean;
  cypressProject?: string;
  specDirectory?: string;
}
