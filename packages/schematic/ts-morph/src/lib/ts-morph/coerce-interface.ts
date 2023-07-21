import {
  classify,
  dasherize,
} from '@rxap/utilities';
import {
  InterfaceDeclaration,
  InterfaceDeclarationStructure,
  OptionalKind,
  Project,
  SourceFile,
} from 'ts-morph';
import {
  TsMorphAngularProjectTransformOptions,
  TsMorphNestProjectTransformOptions,
  TsMorphTransformFunctionRule,
} from '../ts-morph-transform';

export function CoerceInterface(
  sourceFile: SourceFile,
  interfaceName: string,
  structure: Omit<OptionalKind<InterfaceDeclarationStructure>, 'name'> = {},
) {
  let interfaceDeclaration = sourceFile.getInterface(interfaceName);
  if (!interfaceDeclaration) {
    interfaceDeclaration = sourceFile.addInterface({
      ...structure,
      name: interfaceName,
    });
  }
  return interfaceDeclaration;
}

export interface CoerceInterfaceRuleOptions extends TsMorphNestProjectTransformOptions,
                                                    TsMorphAngularProjectTransformOptions {
  name: string;
  structure?: Omit<OptionalKind<InterfaceDeclarationStructure>, 'name'>;
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, interfaceDeclaration: InterfaceDeclaration) => void;
}

export function CoerceInterfaceRule(
  options: CoerceInterfaceRuleOptions,
  tsMorphTransForm: TsMorphTransformFunctionRule<TsMorphNestProjectTransformOptions | TsMorphAngularProjectTransformOptions>,
) {
  let {
    tsMorphTransform,
    project,
    feature,
    shared,
    directory,
    name,
    structure,
  } = options;
  name = classify(name);
  structure ??= {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  tsMorphTransform ??= () => {};

  return tsMorphTransForm({
    project,
    feature,
    shared,
    directory,
  }, (project, [ sourceFile ]) => {
    const interfaceDeclaration = CoerceInterface(sourceFile, name, structure);
    tsMorphTransform!(project, sourceFile, interfaceDeclaration);
  }, [ dasherize(name) + '.ts?' ]);
}
