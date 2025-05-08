import {
  OptionalKind,
  SourceFile,
  TypeParameterDeclarationStructure,
} from 'ts-morph';

export interface CreateDirectiveRuleOptions {
  filePath: string;
  name: string;
  prefix?: string;
  parametersType: string;
  returnType: string;
  template: boolean;
  collection: boolean;
}

export interface CreateDirectiveOptions extends CreateDirectiveRuleOptions {
  sourceFile: SourceFile;
  withoutParameters: boolean;
  typeParameters?: (OptionalKind<TypeParameterDeclarationStructure> | string)[];
}
