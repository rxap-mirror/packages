import {
  classify,
  CoerceSuffix,
  dasherize,
} from '@rxap/utilities';
import {
  ClassDeclarationStructure,
  ObjectLiteralExpression,
  OptionalKind,
  SourceFile,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceDecorator } from '../coerce-decorator';
import { CoerceImports } from '../coerce-imports';
import { GetCoerceArrayLiteralFromObjectLiteral } from '../get-coerce-array-literal-form-object-literal';

export interface CoerceComponentOptions {
  selector?: string;
  prefix?: string;
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
  changeDetection?: 'OnPush' | 'Default';
}

export function CoerceComponent(
  sourceFile: SourceFile,
  name: string,
  options: CoerceComponentOptions = {},
  classStructure: Omit<OptionalKind<ClassDeclarationStructure>, 'name'> = {}
) {
  const className = classify(CoerceSuffix(dasherize(name), '-component'));
  const {
    prefix,
    changeDetection,
  } = options;
  let {
    selector,
    template,
    templateUrl,
    styles,
    styleUrls,
  } = options;

  selector ??= prefix ? `${ prefix }-${ dasherize(name) }` : dasherize(name);
  if (templateUrl === true || !template) {
    template = undefined;
    templateUrl = `./${ dasherize(name) }.component.html`;
  }
  if (styleUrls === true || !styles) {
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
  if (styleUrls && !styleUrls?.startsWith('[')) {
    styleUrls = `[${ styleUrls }]`;
  }

  classStructure.isExported ??= true;

  const classDeclaration = CoerceClass(sourceFile, className, classStructure);

  const componentOptions: Record<string, string | WriterFunction> = {
    standalone: 'true',
    selector: w => w.quote(selector!),
  };

  if (changeDetection) {
    componentOptions['changeDetection'] = `ChangeDetectionStrategy.${ changeDetection }`;
    CoerceImports(sourceFile, {
      namedImports: [ 'Component', 'ChangeDetectionStrategy' ],
      moduleSpecifier: '@angular/core',
    });
  }

  if (template) {
    componentOptions['template'] = w => w.quote(template!);
  }

  if (templateUrl) {
    componentOptions['templateUrl'] = w => w.quote(templateUrl as string);
  }

  if (styles) {
    componentOptions['styles'] = w => w.quote(styles!);
  }

  if (styleUrls) {
    componentOptions['styleUrls'] = styleUrls;
  }

  const componentDecoratorDeclaration = CoerceDecorator(classDeclaration, 'Component', {
    arguments: [
      Writers.object(componentOptions),
    ]
  });

  const componentDecoratorObject = componentDecoratorDeclaration.getArguments()[0];
  if (!componentDecoratorObject) {
    throw new Error(`Could not find component decorator object for component '${ className }'`);
  }
  if (!(componentDecoratorObject instanceof ObjectLiteralExpression)) {
    throw new Error(`Component decorator object for component '${ className }' is not an object literal expression`);
  }

  return { classDeclaration, componentDecoratorObject };
}
