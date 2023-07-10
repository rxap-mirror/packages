import {OptionalKind, ParameterDeclarationStructure, ParameteredNode} from 'ts-morph';

export function CoerceParameterDeclaration(
  node: ParameteredNode,
  name: string,
  structure?: Omit<OptionalKind<ParameterDeclarationStructure>, 'name'>,
) {
  let parameterDeclaration = node.getParameter(name);
  if (!parameterDeclaration) {
    parameterDeclaration = node.addParameter({name});
    parameterDeclaration.set(structure ??
      {});
  }
  return parameterDeclaration;
}
