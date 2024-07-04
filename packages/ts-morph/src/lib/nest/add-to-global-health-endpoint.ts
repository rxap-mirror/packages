import {
  camelize,
  classify,
} from '@rxap/utilities';
import {
  ArrayLiteralExpression,
  MethodDeclaration,
  Scope,
  SourceFile,
  SyntaxKind,
} from 'ts-morph';
import { CoerceClassMethod } from '../coerce-class-method';
import { CoerceImports } from '../coerce-imports';


export function AddToGlobalHealthEndpoint(
  sourceFile: SourceFile,
  name: string,
) {

  const classDeclaration = sourceFile.getClassOrThrow('HealthController');

  const healthIndicatorClass = `${ classify(name) }HealthIndicator`;

  const methodDeclaration: MethodDeclaration = CoerceClassMethod(
    classDeclaration,
    'healthCheck',
    {
      scope: Scope.Public,
      returnType: 'Promise<HealthCheckResult>',
      statements: [
        w => {
          w.writeLine('return this.health.check([');
          w.write(']);');
        },
      ],
      decorators: [
        {
          name: 'Get',
          arguments: [],
        },
        {
          name: 'HealthCheck',
          arguments: [],
        },
      ],
    },
  );

  CoerceImports(sourceFile,[
    {
      moduleSpecifier: '@nestjs/terminus',
      namedImports: [ 'HealthCheck', 'HealthCheckResult' ],
    },
    {
      moduleSpecifier: '@nestjs/common',
      namedImports: [ 'Get' ],
    },
  ]);

  const statement = methodDeclaration.getStatements().find(e => e.getText().match(/return this\.health\.check/));

  const array = statement?.getChildAtIndex(1)?.getChildAtIndex(2)?.getFirstChild();

  if (array?.isKind(SyntaxKind.ArrayLiteralExpression)) {
    array.addElement(w => {
      w.write(`() => this.${ camelize(healthIndicatorClass) }.isHealthy()`);
    });
  }

}
