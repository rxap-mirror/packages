import {
  ControlElement,
  ControlElementToValueContext
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
import { ParsedElement } from '@rxap/xml-parser';
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
} from '@rxap-schematics/utilities';

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

export function OptionsProviderExport(project: Project, name: string) {
  const optionsProviderSourceFilePath = 'data-sources/options-data-source.providers';
  const optionsProviderSourceFile     = project.getSourceFile(optionsProviderSourceFilePath + '.ts') ??
                                        project.createSourceFile(optionsProviderSourceFilePath + '.ts');
  const providersName                 = 'OptionsProviders';

  const optionsDataSourceName = `${classify(name)}OptionsDataSource`;

  optionsProviderSourceFile.addImportDeclarations([
    {
      moduleSpecifier: '@angular/core',
      namedImports:    [ 'Provider' ]
    },
    {
      moduleSpecifier: `./${dasherize(name)}.options.data-source`,
      namedImports:    [ optionsDataSourceName ]
    }
  ]);

  AddToArray(optionsProviderSourceFile, providersName, optionsDataSourceName, 'Provider[]');

  const formProviderSourceFile = AddToFormProviders(project, providersName);

  formProviderSourceFile.addImportDeclaration({
    moduleSpecifier: `./${optionsProviderSourceFilePath}`,
    namedImports:    [ providersName ]
  });

}

@ElementDef('data-source')
export class DataSourceElement implements ParsedElement<Array<string | WriterFunction>> {

  public __tag!: string;
  public __parent!: SelectOptionsElement;

  @ElementTextContent()
  @ElementRequired()
  public id!: string;

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile, project }: ToValueContext & { sourceFile: SourceFile }): Array<string | WriterFunction> {

    const dataSourceName = classify(this.id) + 'OptionsDataSource';

    OptionsProviderExport(project, this.id);

    sourceFile.addImportDeclaration({
      moduleSpecifier: `./data-sources/${dasherize(this.id)}.options.data-source`,
      namedImports:    [ dataSourceName ]
    });

    const dataSourceFilePath = `data-sources/${dasherize(this.id)}.options.data-source`;

    if (!project.getSourceFile(`${dataSourceFilePath}.ts`)) {

      const dataSourceSourceFile = project.createSourceFile(`${dataSourceFilePath}.ts`);

      dataSourceSourceFile.addClass({
        name:       dataSourceName,
        isExported: true,
        decorators: [
          {
            name:      'RxapDataSource',
            arguments: [ writer => writer.quote(dasherize(this.id)) ]
          },
          {
            name:      'Injectable',
            arguments: []
          }
        ],
        extends:    'BaseDataSource<ControlOptions>'
      });

      dataSourceSourceFile.addImportDeclarations([
        {
          moduleSpecifier: '@angular/core',
          namedImports:    [ 'Injectable' ]
        },
        {
          moduleSpecifier: '@rxap/data-source',
          namedImports:    [ 'RxapDataSource', 'BaseDataSource' ]
        },
        {
          moduleSpecifier: '@rxap/utilities',
          namedImports:    [ 'ControlOptions' ]
        }
      ]);

    }

    return [ dataSourceName ];

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
  @ElementRequired()
  public display!: string;

  @ElementTextContent()
  public value!: string;

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
      return `source => ${this.name}(source, value => getFromObject(value, '${this.value}'), value => getFromObject(value, '${this.display}'))`;
    } else {
      return `source => ${this.name}(source, value => getFromObject(value, '${this.value}'))`;
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
export class OpenApiDataSourceElement implements DataSourceElement {

  public __tag!: string;
  public __parent!: SelectOptionsElement;

  @ElementChildTextContent()
  @ElementRequired()
  public id!: string;

  @ElementChildren(DataSourceTransformerElement, { group: 'transformers' })
  public transformers!: DataSourceTransformerElement[];

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): Array<string | WriterFunction> {

    const dataSourceName = classify(this.id) + 'DataSource';

    sourceFile.addImportDeclaration({
      moduleSpecifier: `${options.openApiModule}/data-sources/${dasherize(this.id)}.data-source`,
      namedImports:    [ dataSourceName ]
    });

    const args: Array<string | WriterFunction> = [ dataSourceName ];

    if (this.transformers?.length) {

      const transformerFunction: string[] = [];

      for (const transformer of this.transformers) {
        transformerFunction.push(transformer.toValue({ project, sourceFile, options }));
      }

      if (transformerFunction.length > 1) {
        args.push(Writers.object({
          transformer: '[' + transformerFunction.join(', ') + ']'
        }));
      } else {
        args.push(Writers.object({
          transformer: transformerFunction[ 0 ]
        }));
      }

    }

    return args;

  }

}

@ElementExtends(DataSourceElement)
@ElementDef('form-data-source')
export class FormDataSourceElement implements DataSourceElement {

  public __tag!: string;
  public __parent!: SelectOptionsElement;

  @ElementChildTextContent()
  @ElementRequired()
  public id!: string;

  @ElementChildren(DataSourceTransformerElement)
  public transformers!: DataSourceTransformerElement[];

  public validate(): boolean {
    return true;
  }

  public toValue({ sourceFile, project }: ToValueContext & { sourceFile: SourceFile }): Array<string | WriterFunction> {
    return [];
  }

}

@ElementDef('options')
export class SelectOptionsElement extends OptionsElement implements ParsedElement<Array<string | WriterFunction>> {

  public __parent!: SelectControlElement;

  @ElementChild(DataSourceElement)
  public dataSource?: DataSourceElement;

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): Array<string | WriterFunction> {

    if (this.dataSource) {

      return this.dataSource.toValue({ sourceFile, project, options });
    }

    const optionsFilePath = `data-sources/${dasherize(this.__parent.id)}.options.data-source`;

    const optionsSourceFile = project.createSourceFile(optionsFilePath + '.ts', undefined, { overwrite: true });

    const optionsDataSourceName = classify(this.__parent.id) + 'OptionsDataSource';

    OptionsProviderExport(project, this.__parent.id);

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

                writer.write('[');
                writer.newLine();

                for (const option of this.options) {

                  Writers.object({
                    value:   option.value === undefined ? w => w.quote(option.display.toString()) : option.value,
                    display: w => w.quote(option.display.toString())
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
