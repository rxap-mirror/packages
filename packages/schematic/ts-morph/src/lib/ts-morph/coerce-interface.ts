import {
  NormalizeDataPropertyToPropertySignatureStructure,
  NormalizedDataProperty,
} from '@rxap/ts-morph';
import {
  classify,
  dasherize,
  noop,
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
  propertyList?: NormalizedDataProperty[];
  tsMorphTransform?: (project: Project, sourceFile: SourceFile, interfaceDeclaration: InterfaceDeclaration) => void;
}

export function CoerceInterfaceRule(
  options: CoerceInterfaceRuleOptions,
  tsMorphTransForm: TsMorphTransformFunctionRule<TsMorphNestProjectTransformOptions | TsMorphAngularProjectTransformOptions>,
) {
  const {
    tsMorphTransform = noop,
    project,
    feature,
    shared,
    directory,
    structure = { isExported: true },
    propertyList,
  } = options;
  let { name } = options;
  name = classify(name);

  return tsMorphTransForm({
    project,
    feature,
    shared,
    directory,
  }, (project, [ sourceFile ]) => {
    if (propertyList) {
      structure.properties = propertyList.map(p => NormalizeDataPropertyToPropertySignatureStructure(p, sourceFile));
    }
    const interfaceDeclaration = CoerceInterface(sourceFile, name, structure);
    tsMorphTransform(project, sourceFile, interfaceDeclaration);
  }, [ dasherize(name) + '.ts?' ]);
}
