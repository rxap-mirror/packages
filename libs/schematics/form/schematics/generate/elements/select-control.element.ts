import {
  ControlElement,
  ControlElementToValueContext,
  ControlTypeElement
} from './control.element';
import {
  ElementDef,
  ElementChild,
  ElementRequired,
  ElementChildTextContent,
  ElementChildren,
  ElementTextContent,
  ElementExtends,
  ElementClearParser,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import { OptionsElement } from '@rxap/xml-parser/elements';
import {
  ParsedElement,
  ElementFactory
} from '@rxap/xml-parser';
import {
  WriterFunction,
  Writers,
  PropertyDeclaration,
  Project,
  SourceFile
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  OverwriteDecorator,
  AddToArray,
  AddToFormProviders,
  ToValueContext
} from '@rxap/schematics-ts-morph';
import { GenerateSchema } from '../schema';

const { dasherize, classify, camelize } = strings;

@ElementDef('transformer')
export class DataSourceTransformerElement implements ParsedElement<string> {

  @ElementChildTextContent()
  @ElementRequired()
  public from!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile }: ToValueContext & { sourceFile: SourceFile }): string {

    sourceFile.addImportDeclaration({
      moduleSpecifier: this.from,
      namedImports:    [ this.name ]
    });

    return this.name;

  }

}

export function OptionsProviderExport(project: Project, name: string, from: string, overwrite: boolean | undefined) {
  const optionsProviderSourceFilePath = 'data-sources/options-data-source.providers';
  const optionsProviderSourceFile     = project.getSourceFile(optionsProviderSourceFilePath + '.ts') ??
                                        project.createSourceFile(optionsProviderSourceFilePath + '.ts');
  const providersName                 = 'OptionsProviders';

  optionsProviderSourceFile.addImportDeclarations([
    {
      moduleSpecifier: '@angular/core',
      namedImports:    [ 'Provider' ]
    },
    {
      moduleSpecifier: from,
      namedImports:    [ name ]
    }
  ]);

  AddToArray(optionsProviderSourceFile, providersName, name, 'Provider[]', overwrite);

  const formProviderSourceFile = AddToFormProviders(project, providersName, overwrite);

  formProviderSourceFile.addImportDeclaration({
    moduleSpecifier: `./${optionsProviderSourceFilePath}`,
    namedImports:    [ providersName ]
  });

}

@ElementDef('data-source')
export class DataSourceElement implements ParsedElement<Array<string | WriterFunction>> {

  public __tag!: string;
  public __parent!: SelectOptionsElement;

  @ElementChildTextContent()
  public name!: string;

  @ElementChildTextContent()
  public id!: string;

  @ElementChildTextContent()
  public from!: string;

  @ElementChildren(DataSourceTransformerElement, { group: 'transformers' })
  public transformers!: DataSourceTransformerElement[];

  public postParse() {
    if (!this.name && !this.from && this.id) {
      this.name = classify(this.id) + 'DataSource';
    }
  }

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile, project, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }): Array<string | WriterFunction> {

    if (!this.from && this.id) {

      const optionsFilePath = `data-sources/${dasherize(this.id)}.data-source`;

      if (!project.getSourceFile(optionsFilePath + '.ts')) {

        const optionsSourceFile = project.createSourceFile(optionsFilePath + '.ts');

        OptionsProviderExport(project, this.name, `./${dasherize(this.id)}.data-source`, options.overwrite);

        optionsSourceFile.addClass({
          name:       this.name,
          isExported: true,
          extends:    'BaseDataSource<ControlOptions>',
          decorators: [
            {
              name:      'Injectable',
              arguments: []
            },
            {
              name:      'RxapDataSource',
              arguments: [ writer => writer.quote(this.id) ]
            }
          ]
        });

        optionsSourceFile.addImportDeclarations([
          {
            moduleSpecifier: '@angular/core',
            namedImports:    [ 'Injectable' ]
          },
          {
            moduleSpecifier: '@rxap/data-source',
            namedImports:    [ 'BaseDataSource', 'RxapDataSource' ]
          },
          {
            moduleSpecifier: '@rxap/utilities',
            namedImports:    [ 'ControlOptions' ]
          }
        ]);

      }

      this.from = `./${optionsFilePath}`;

    }

    sourceFile.addImportDeclaration({
      moduleSpecifier: this.from,
      namedImports:    [ this.name ]
    });

    const args: Array<string | WriterFunction> = [ this.name ];

    if (this.transformers?.length) {

      const transformerFunction: string[] = [];

      for (const transformer of this.transformers) {
        transformerFunction.push(transformer.toValue({ project, sourceFile, options }));
      }

      if (transformerFunction.length > 1) {
        args.push(Writers.object({
          transformer: 'ComposeOptionsTransformers(' + transformerFunction.join(', ') + ')'
        }));
        sourceFile.addImportDeclaration({
          namedImports:    [ 'ComposeOptionsTransformers' ],
          moduleSpecifier: '@rxap/form-system'
        });
      } else {
        args.push(Writers.object({
          transformer: transformerFunction[ 0 ]
        }));
      }

    }

    return args;

  }

}

@ElementExtends(DataSourceTransformerElement)
@ElementDef('to-options-with-object')
export class ToOptionsWithObjectElement extends DataSourceTransformerElement {

  @ElementClearParser()
  public name = 'ToOptionsWithObject';

  @ElementClearParser()
  public from = '@rxap/utilities';

  @ElementAttribute()
  public display!: string;

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {
    super.toValue({ sourceFile, project, options });

    if (this.display) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: '@rxap/utilities',
        namedImports:    [ 'getFromObject' ]
      });
      return `source => ${this.name}(source, value => getFromObject(value, '${this.display}'))`;
    } else {
      return this.name;
    }

  }

}

@ElementExtends(DataSourceTransformerElement)
@ElementDef('to-options')
export class ToOptionsElement extends DataSourceTransformerElement {

  @ElementClearParser()
  public name = 'ToOptions';

  @ElementClearParser()
  public from = '@rxap/utilities';

  @ElementAttribute()
  public display?: string;

  @ElementTextContent()
  public value?: string;

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {
    super.toValue({ sourceFile, project, options });

    if (this.display || this.value) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: '@rxap/utilities',
        namedImports:    [ 'getFromObject' ]
      });
    }

    if (this.display) {
      if (this.value) {
        return `source => ${this.name}(source, value => getFromObject(value, '${this.value}'), value => getFromObject(value, '${this.display}'))`;
      } else {
        return `source => ${this.name}(source, value => value, value => getFromObject(value, '${this.display}'))`;
      }
    } else if (this.value) {
      return `source => ${this.name}(source, value => getFromObject(value, '${this.value}'))`;
    } else {
      return `source => ${this.name}(source, value => value)`;
    }

  }

}

@ElementExtends(DataSourceTransformerElement)
@ElementDef('to-options-from-object')
export class ToOptionsFromObjectElement extends DataSourceTransformerElement {

  @ElementClearParser()
  public name = 'ToOptionsFromObject';

  @ElementClearParser()
  public from = '@rxap/utilities';

  @ElementAttribute()
  public display?: string;

  @ElementTextContent()
  public value: string = 'value => value';

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {
    super.toValue({ sourceFile, project, options });

    if (this.display) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: '@rxap/utilities',
        namedImports:    [ 'getFromObject' ]
      });
      return `source => ${this.name}(source, ${this.value}, value => getFromObject(value, '${this.display}'))`;
    } else {
      return `source => ${this.name}(source, ${this.value})`;
    }

  }

}

@ElementExtends(DataSourceElement)
@ElementDef('open-api-data-source')
export class OpenApiDataSourceElement extends DataSourceElement {

  public postParse() {
    this.name = classify(this.id) + 'DataSource';
  }

  public validate(): boolean {
    return !!this.id;
  }

  public toValue({ sourceFile, project, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }): Array<string | WriterFunction> {
    this.from = `${options.openApiModule}/data-sources/${dasherize(this.id)}.data-source`;
    return super.toValue({ sourceFile, project, options });
  }

}

@ElementExtends(DataSourceElement)
@ElementDef('form-data-source')
export class FormDataSourceElement extends DataSourceElement {

  public toValue({ sourceFile, project }: ToValueContext & { sourceFile: SourceFile }): Array<string | WriterFunction> {
    return [];
  }

}

@ElementDef('options')
export class SelectOptionsElement extends OptionsElement implements ParsedElement<Array<string | WriterFunction>> {

  public __parent!: SelectControlElement;

  @ElementChild(DataSourceElement)
  public dataSource?: DataSourceElement;

  public toValue({ sourceFile, project, options }: ToValueContext<GenerateSchema> & { sourceFile: SourceFile }): Array<string | WriterFunction> {

    if (this.dataSource) {

      return this.dataSource.toValue({ sourceFile, project, options });
    }

    const optionsFilePath = `data-sources/${dasherize(this.__parent.id)}.options.data-source`;

    const optionsSourceFile = project.createSourceFile(optionsFilePath + '.ts', undefined, { overwrite: true });

    const optionsDataSourceName = classify(this.__parent.id) + 'OptionsDataSource';

    OptionsProviderExport(project, optionsDataSourceName, `./${dasherize(this.__parent.id)}.options.data-source`, options.overwrite);

    optionsSourceFile.addClass({
      name:       optionsDataSourceName,
      isExported: true,
      extends:    'StaticDataSource<ControlOptions>',
      decorators: [
        {
          name:      'Injectable',
          arguments: []
        },
        {
          name:      'RxapStaticDataSource',
          arguments: [
            Writers.object({
              id:   writer => writer.quote(dasherize(this.__parent.id) + '-options'),
              data: writer => {

                if (this.options.some(option => option.i18n)) {
                  writer.write('() => ');
                }

                writer.write('[');
                writer.newLine();

                for (const option of this.options) {

                  Writers.object({
                    value:   option.value === undefined ? w => w.quote(option.display.toString()) : option.value,
                    display: w => {
                      if (option.i18n) {
                        w.write(`$localize\`:@@form.${this.__parent.controlPath}.${option.i18n}:${option.display.toString()}\``);
                      } else {
                        w.quote(option.display.toString());
                      }
                    }
                  })(writer);

                  writer.write(',');
                  writer.newLine();

                }

                writer.write(']');

              }
            })
          ]
        }
      ]
    });

    optionsSourceFile.addImportDeclarations([
      {
        moduleSpecifier: '@angular/core',
        namedImports:    [ 'Injectable' ]
      },
      {
        moduleSpecifier: '@rxap/data-source',
        namedImports:    [ 'StaticDataSource', 'RxapStaticDataSource' ]
      },
      {
        moduleSpecifier: '@rxap/utilities',
        namedImports:    [ 'ControlOptions' ]
      }
    ]);

    sourceFile.addImportDeclaration({
      moduleSpecifier: `./${optionsFilePath}`,
      namedImports:    [ optionsDataSourceName ]
    });

    return [ optionsDataSourceName ];
  }

}

@ElementExtends(ControlElement)
@ElementDef('select-control')
export class SelectControlElement extends ControlElement {

  @ElementChild(SelectOptionsElement)
  @ElementRequired()
  public options!: SelectOptionsElement;

  @ElementAttribute()
  public multiple?: boolean;

  public postParse() {
    if (!this.type) {
      if (this.multiple) {
        this.type = ElementFactory(ControlTypeElement, { name: 'any[]' });
      }
    }
    if (!this.initial) {
      if (this.multiple) {
        this.initial = '[]';
      }
    }
  }

  public toValue({ classDeclaration, sourceFile, project, options }: ControlElementToValueContext): PropertyDeclaration {
    const controlProperty = super.toValue({ classDeclaration, sourceFile, project, options });

    OverwriteDecorator(controlProperty, {
      name:      'UseOptionsDataSource',
      arguments: this.options.toValue({ sourceFile, project, options })
    });

    sourceFile.addImportDeclaration({
      moduleSpecifier: '@rxap/form-system',
      namedImports:    [ 'UseOptionsDataSource' ]
    });

    return controlProperty;
  }

}
