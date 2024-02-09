import {
  CoerceDecorator,
} from '../coerce-decorator';
import {
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import {
  ClassDeclarationStructure,
  ObjectLiteralExpression,
  OptionalKind,
  SourceFile,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';

export interface CoerceComponentOptions {
  selector?: string;
  template?: string;
  styles?: string;
  /**
   * true - use the component name to generate the templateUrl
   */
  templateUrl?: string | true;
  /**
   * true - use the component name to generate a styleUrl
   */
  styleUrls?: string | string[] | true;
}

export function CoerceComponent(
  sourceFile: SourceFile,
  name: string,
  options: CoerceComponentOptions = {},
  classStructure: Omit<OptionalKind<ClassDeclarationStructure>, 'name'> = {}
) {
  const className = CoerceSuffix(dasherize(name), '-component');
  let {
    selector,
    template,
    templateUrl,
    styles,
    styleUrls,
  } = options;

  selector ??= dasherize(name);
  if (templateUrl === true) {
    template = undefined;
    templateUrl = `./${ dasherize(name) }.component.html`;
  }
  if (styleUrls === true) {
    styles = undefined;
    styleUrls = [ `./${ dasherize(name) }.component.scss` ];
  }
  if (!templateUrl) {
    template ??= '';
  }
  if (!styleUrls) {
    styles ??= '[]';
  }
  if (Array.isArray(styleUrls)) {
    styleUrls = `['${ styleUrls.join('\',\n\'') }']`;
  }
  if (!styleUrls?.startsWith('[')) {
    styleUrls = `[${ styleUrls }]`;
  }

  classStructure.isExported ??= true;

  const classDeclaration = CoerceClass(sourceFile, className, classStructure);

  const componentDecoratorDeclaration = CoerceDecorator(classDeclaration, 'Component', {
    arguments: [
      Writers.object({
        standalone: 'true',
        selector: w => w.quote(selector!),
        template: template !== undefined ? w => w.quote(template!) : undefined,
        templateUrl: templateUrl !== undefined ? w => w.quote(templateUrl! as string) : undefined,
        styles: styles !== undefined ? w => w.quote(styles!) : undefined,
        styleUrls: styleUrls !== undefined ? w => w.quote(styleUrls as string) : undefined,
        providers: '[]',
        imports: '[]',
      }),
    ]
  });

  const componentDecoratorObject = componentDecoratorDeclaration.getArguments()[0];
  if (!componentDecoratorObject) {
    throw new Error(`Could not find component decorator object for component '${ className }'`);
  }
  if (!(componentDecoratorObject instanceof ObjectLiteralExpression)) {
    throw new Error(`Component decorator object for component '${ className }' is not an object literal expression`);
  }
  const providersArray = GetCoerceArrayLiteralFromObjectLiteral(componentDecoratorObject, 'providers');
  const importsArray = GetCoerceArrayLiteralFromObjectLiteral(componentDecoratorObject, 'providers');

  return { classDeclaration, componentDecoratorObject, providersArray, importsArray };
}
