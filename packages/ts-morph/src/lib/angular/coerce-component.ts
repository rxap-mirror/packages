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
  SyntaxKind,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceClass } from '../coerce-class';
import { CoerceDecorator } from '../coerce-decorator';
import { CoerceImports } from '../coerce-imports';

export interface CoerceComponentOptions {
  /**
   * The selector for the component.
   * If false, no selector is added.
   */
  selector?: string | false;
  /**
   * Prefix to use for the selector (defaults to project prefix).
   */
  prefix?: string;
  /**
   * Inline template string.
   */
  template?: string;
  /**
   * Inline styles string or array of strings.
   */
  styles?: string;
  /**
   * Path to external template file.
   * If true, generates default path based on component name.
   */
  templateUrl?: string | true;
  /**
   * Path(s) to external style files.
   * If true, generates default path based on component name.
   */
  styleUrls?: string | string[] | true;
  /**
   * Change detection strategy (OnPush or Default).
   */
  changeDetection?: 'OnPush' | 'Default';
}

/**
 * Coerces an Angular component class declaration.
 * Creates the component class and decorates it with @Component.
 *
 * @param sourceFile - The source file to add the component to.
 * @param name - The name of the component (kebab-case).
 * @param options - Options for the component (selector, template, styles, etc.).
 * @param classStructure - Optional structure for the class.
 * @returns An object containing the class declaration and the component decorator object.
 */
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

  if (selector !== false) {
    selector ??= prefix ? `${ prefix }-${ dasherize(name) }` : dasherize(name);
    if (selector.includes('{{prefix}}')) {
      if (!prefix) {
        throw new Error(
          `The selector '${ selector }' contains a template expression '{{prefix}}' but no prefix is provided`);
      }
      selector = selector.replace('{{prefix}}', prefix);
    }
    if (selector.match(/\{\{.*}}/)) {
      throw new Error(`The selector '${ selector }' contains an invalid templates expression`);
    }
  }
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
  };

  if (selector) {
    componentOptions['selector'] = w => w.quote(selector as string);
  }

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
  if (!(componentDecoratorObject.isKind(SyntaxKind.ObjectLiteralExpression))) {
    throw new Error(`Component decorator object for component '${ className }' is not an object literal expression`);
  }

  return { classDeclaration, componentDecoratorObject };
}
