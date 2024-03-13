import {
  ClassDeclaration,
  DecoratableNode,
  DecoratorStructure,
  OptionalKind,
  PropertyDeclaration,
  PropertyNamedNode,
  Scope,
  SetAccessorDeclaration,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceSetAccessorDeclaration } from '../coerce-accessor-declaration';
import { CoerceDecorator } from '../coerce-decorator';
import { CoerceImports } from '../coerce-imports';
import { CoercePropertyDeclaration } from '../coerce-property-declaration';
import { HasConstructorParameter } from '../has-constructor-parameter';
import { TypeImport } from '../type-import';
import { WriteType } from '../write-type';
import { GetComponentClass } from './get-component-class';

export interface ComponentInputDefinition {
  alias?: string;
  isRequired?: boolean;
  initializer?: string | WriterFunction;
  asSetAccessor?: boolean;
}

export interface SetComponentInputDefinition extends ComponentInputDefinition {
  asSetAccessor: true;
}

export type PropertyComponentInputDefinition = Omit<ComponentInputDefinition, 'asSetAccessor'>;


export function CoerceComponentInput(
  classDeclaration: ClassDeclaration,
  name: string,
  type: string | TypeImport | WriterFunction,
  options?: PropertyComponentInputDefinition
): PropertyDeclaration;
export function CoerceComponentInput(
  sourceFile: SourceFile,
  name: string,
  type: string | TypeImport | WriterFunction,
  options?: PropertyComponentInputDefinition
): PropertyDeclaration;
export function CoerceComponentInput(
  classDeclaration: ClassDeclaration,
  name: string,
  type: string | TypeImport | WriterFunction,
  options?: SetComponentInputDefinition
): SetAccessorDeclaration;
export function CoerceComponentInput(
  sourceFile: SourceFile,
  name: string,
  type: string | TypeImport | WriterFunction,
  options?: SetComponentInputDefinition
): SetAccessorDeclaration;
export function CoerceComponentInput(
  classDeclaration: ClassDeclaration,
  name: string,
  type: string | TypeImport | WriterFunction,
  options?: ComponentInputDefinition
): PropertyNamedNode & DecoratableNode;
export function CoerceComponentInput(
  sourceFile: SourceFile,
  name: string,
  type: string | TypeImport | WriterFunction,
  options?: ComponentInputDefinition
): PropertyNamedNode & DecoratableNode;
export function CoerceComponentInput(
  sourceFileOrClassDeclaration: SourceFile | ClassDeclaration,
  name: string,
  type: string | TypeImport | WriterFunction,
  { initializer, alias, isRequired, asSetAccessor }: ComponentInputDefinition = {},
): PropertyNamedNode & DecoratableNode {

  const classDeclaration = sourceFileOrClassDeclaration instanceof ClassDeclaration ? sourceFileOrClassDeclaration : GetComponentClass(sourceFileOrClassDeclaration);
  const sourceFile = sourceFileOrClassDeclaration instanceof SourceFile ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();

  if (HasConstructorParameter(classDeclaration, name, true)) {
    throw new Error(`The component '${classDeclaration.getName() }' already has a constructor parameter that is a class member with the name '${ name }'. Cannot add an input with the same name!`);
  }

  CoerceImports(sourceFile, {
    namedImports: [ 'Input' ],
    moduleSpecifier: '@angular/core',
  });

  const inputDecoratorStructure: OptionalKind<DecoratorStructure> = {
    name: 'Input',
    arguments: [],
  };

  if (alias || isRequired) {
    const inputArgument: Record<string, string | WriterFunction> = {};
    if (alias) {
      inputArgument['alias'] = w => w.quote(alias);
    }
    if (isRequired) {
      inputArgument['required'] = 'true';
    }
    inputDecoratorStructure.arguments = [ Writers.object(inputArgument) ];
  }

  let propertyNode: PropertyNamedNode & DecoratableNode;

  if (asSetAccessor) {

    propertyNode = CoerceSetAccessorDeclaration(classDeclaration, name, { statements: `this._${ name } = ${ name };` }).set({
      scope: Scope.Public,
      parameters: [
        {
          name: name,
          type: WriteType(type, sourceFile),
        },
      ],
    });

    CoercePropertyDeclaration(classDeclaration, '_' + name, { scope: Scope.Private }).set({
      type: WriteType(type, sourceFile),
      initializer: initializer,
      hasQuestionToken: !initializer && !isRequired,
      hasExclamationToken: !initializer && isRequired,
    });

  } else {

    propertyNode = CoercePropertyDeclaration(classDeclaration, name).set({
      scope: Scope.Public,
      type: WriteType(type, sourceFile),
      initializer,
      hasQuestionToken: !initializer && !isRequired,
      hasExclamationToken: !initializer && isRequired,
    });

  }

  CoerceDecorator(propertyNode, 'Input', inputDecoratorStructure);

  return propertyNode;

}
