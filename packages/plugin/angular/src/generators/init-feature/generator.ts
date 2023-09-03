import {
  generateFiles,
  Tree,
} from '@nx/devkit';
import { GetProjectSourceRoot } from '@rxap/generator-utilities';
import {
  CoerceArrayElement,
  FindArrayElementByObjectProperty,
} from '@rxap/ts-morph';
import { TsMorphAngularProjectTransform } from '@rxap/workspace-ts-morph';
import * as path from 'path';
import {
  ArrayLiteralExpression,
  ObjectLiteralExpression,
  PropertyAssignment,
  SourceFile,
  StructureKind,
  SyntaxKind,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { InitFeatureGeneratorSchema } from './schema';

export interface AngularRoute {
  path: string;
  loadChildren?: string;
  loadComponent?: string;
}

function buildRouteObject(route: AngularRoute) {
  const obj: Record<string, string | WriterFunction> = {
    path: w => w.quote(route.path),
  };
  if (route.loadChildren) {
    obj.loadChildren = `() => import('${ route.loadChildren }')`;
  }
  if (route.loadComponent) {
    obj.loadComponent = `() => import('${ route.loadComponent }')`;
  }
  return Writers.object(obj);
}

function findParentRoute(ale: ArrayLiteralExpression, path: string[]): ArrayLiteralExpression | null {
  for (const e of ale.getElements()) {
    if (e instanceof ObjectLiteralExpression) {
      const pathProperty = e.getProperty('path');
      if (pathProperty && pathProperty instanceof PropertyAssignment) {
        const initializer = pathProperty.getInitializerIfKind(SyntaxKind.StringLiteral);
        if (initializer) {
          const fragment = path.pop();
          if (initializer.getLiteralText() === fragment) {
            const childrenProperty = e.getProperty('children') ?? e.addProperty({
              name: 'children',
              initializer: '[]',
              kind: StructureKind.PropertyAssignment,
            });
            if (childrenProperty instanceof PropertyAssignment) {
              const children = childrenProperty.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
              if (path.length) {
                // console.log('Continue search for parent route');
                return findParentRoute(children, path);
              } else {
                // console.log('Found parent route');
                return children;
              }
            } else {
              // console.log('Children property is not a PropertyAssignment');
            }
          } else {
            // console.log('Path property does not match', initializer.getLiteralText(), fragment);
          }
        } else {
          // console.log('Path property has no StringLiteral initializer');
        }
      } else {
        // console.log('Element has no path property');
      }
    } else {
      // console.log('Element is not an ObjectLiteralExpression');
    }
  }
  return null;
}

export function AddRoute(sourceFile: SourceFile, route: AngularRoute, path?: string[]) {
  const routes = sourceFile.getVariableDeclaration('ROUTES');
  if (routes) {
    let initializer = routes.getInitializerIfKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    if (path?.length) {
      initializer = findParentRoute(initializer, path);
    }
    if (initializer) {
      CoerceArrayElement(initializer, FindArrayElementByObjectProperty('path', route.path), buildRouteObject(route));
    } else {
      console.warn('Initializer not found');
    }
  } else {
    console.warn('appRoutes variable not found');
  }
}

export async function initFeatureGenerator(
  tree: Tree,
  options: InitFeatureGeneratorSchema,
) {
  const projectSourceRoot = GetProjectSourceRoot(tree, options.project);
  generateFiles(tree, path.join(__dirname, 'files'), projectSourceRoot, { name: options.name });
  TsMorphAngularProjectTransform(tree, {
    project: options.project,
  }, (_, [ sourceFile ]) => {
    AddRoute(sourceFile, {
      path: options.name,
      loadChildren: '../feature/' + options.name + '/routes',
    }, [ '' ]);
  }, [ 'app/layout.routes.ts' ]);
}

export default initFeatureGenerator;
