import type {
  JSONSchema,
  Options,
} from '@apidevtools/json-schema-ref-parser';
import * as $RefParser from '@apidevtools/json-schema-ref-parser';
import {
  IndentationText,
  OptionalKind,
  Project,
  PropertySignatureStructure,
  QuoteKind,
  SourceFile,
  TypeAliasDeclarationStructure,
  TypeElementMemberedNodeStructure,
  WriterFunction,
  Writers,
} from 'ts-morph';
import { CoerceImports } from './coerce-imports';
import { getFromObject } from './get-from-object';
import { joinPath } from './join';
import {
  classify,
  dasherize,
  underscore,
} from './strings';

export interface TypescriptInterfaceGeneratorOptions extends Options {
  suffix?: string;
  basePath?: string;
  addImports?: boolean;
}

export class TypescriptInterfaceGenerator {

  private readonly project: Project;

  public static isRequired(schema: JSONSchema, key: string): boolean {
    return (
      !!schema.required &&
      Array.isArray(schema.required) &&
      schema.required.includes(key)
    );
  }

  public static coercePropertyKey(key: string): string {
    if (
      key.match(/(^[0-9]+|-|#|\.|@|\/|:|\*)/) &&
      !key.match(/\[\w+:\s?\w+\]/)
    ) {
      return `'${ key }'`;
    }
    return key;
  }

  public static unionType(
    array: Array<string | WriterFunction>,
  ): WriterFunction | string {
    if (array.length < 2) {
      return array[0];
    }

    const first = array.shift()!;
    const second = array.shift()!;

    return Writers.unionType(first, second, ...array);
  }

  public static intersectionType(
    array: Array<string | WriterFunction>,
  ): WriterFunction | string {
    if (array.length < 2) {
      return array[0];
    }

    const first = array.shift()!;
    const second = array.shift()!;

    return Writers.intersectionType(first, second, ...array);
  }

  private importList: Array<{ name: string, moduleSpecifier: string }> = [];

  constructor(
    private readonly schema: JSONSchema,
    private readonly options: TypescriptInterfaceGeneratorOptions = {},
    project: Project | null = null,
  ) {
    this.project =
      project ??
      new Project({
        manipulationSettings: {
          indentationText: IndentationText.TwoSpaces,
          quoteKind: QuoteKind.Single,
          useTrailingCommas: true,
        },
      });
  }

  private bundledSchema: JSONSchema | null = null;

  public static bundleSchema<T extends JSONSchema>(schema: T, options: TypescriptInterfaceGeneratorOptions = {}) {
    return $RefParser.bundle(schema, options) as Promise<T>;
  }

  public async build(name: string): Promise<SourceFile> {
    await this.bundleSchema();
    return this.buildSync(name, this.bundledSchema);
  }

  public buildSync(name: string, bundledSchema: JSONSchema | null = this.bundledSchema ?? this.schema): SourceFile {
    this.bundledSchema = bundledSchema;

    if (!this.bundledSchema) {
      throw new Error('If buildSync is called, bundledSchema must be provided!');
    }

    this.importList = [];

    const sourceFile = this.addType(this.bundledSchema, name);

    for (const importItem of this.importList) {
      CoerceImports(sourceFile,{
        isTypeOnly: true,
        moduleSpecifier: importItem.moduleSpecifier,
        namedImports: [ importItem.name ],
      });
    }

    return sourceFile;

  }

  private addType(schema: JSONSchema, name: string): SourceFile {
    let resolvedSchema: JSONSchema;

    if (schema.$ref) {
      resolvedSchema = this.resolveRef(schema.$ref);
    } else {
      resolvedSchema = schema;
    }

    let sourceFile: SourceFile;

    if (resolvedSchema.type === 'object' && resolvedSchema.properties) {
      sourceFile = this.addInterface(resolvedSchema, name);
    } else {
      sourceFile = this.addTypeAlias(resolvedSchema, name);
    }

    return sourceFile;
  }

  private addTypeAlias(schema: JSONSchema, name: string): SourceFile {
    const filePath = joinPath(
      this.options.basePath,
      `${ this.getFileName(name) }.ts`,
    );

    let sourceFile = this.project.getSourceFile(filePath);

    if (sourceFile) {
      return sourceFile;
    }

    sourceFile = this.project.createSourceFile(filePath);

    const type = this.propertyTypeWriteFunction(sourceFile, schema, name);

    if (!type) {
      throw new Error('Could not create a write function for the type!');
    }

    const typeAliasDeclarationStructure: OptionalKind<TypeAliasDeclarationStructure> =
      {
        name: this.buildName(name),
        type: type === 'unknown' ? 'T' : type,
        isExported: true,
        typeParameters: type === 'unknown' ?
          [
            {
              name: 'T',
              default: 'unknown',
            },
          ] :
          undefined,
      };

    sourceFile.addTypeAlias(typeAliasDeclarationStructure);

    return sourceFile;
  }

  private addInterface(schema: JSONSchema, name: string): SourceFile {
    const filePath = joinPath(
      this.options.basePath,
      `${ this.getFileName(name) }.ts`,
    );

    let sourceFile = this.project.getSourceFile(filePath);

    if (sourceFile) {
      return sourceFile;
    }

    sourceFile = this.project.createSourceFile(filePath);

    if (!schema.properties) {
      console.debug(schema.$ref, schema.type, Object.keys(schema));
      throw new Error('The provided schema has not a properties declaration!');
    }

    const properties: OptionalKind<PropertySignatureStructure>[] = [];

    for (const [ key, property ] of Object.entries(
      schema.properties as Record<string, JSONSchema>,
    )) {
      properties.push(
        this.buildPropertySignatureStructure(
          sourceFile,
          key,
          property,
          TypescriptInterfaceGenerator.isRequired(schema, key),
        ),
      );
    }

    const typeName = this.buildName(name);

    if (schema.additionalProperties === true) {
      sourceFile.addTypeAlias({
        name: typeName,
        isExported: true,
        type: w => {
          Writers.objectType({
            properties,
          })(w);
          w.write(' & ');
          w.write('T');
        },
        typeParameters: [
          {
            name: 'T',
            default: 'unknown',
          },
        ],
      });
    } else {
      sourceFile.addInterface({
        name: typeName,
        properties,
        isExported: true,
      });
    }

    return sourceFile;
  }

  private buildPropertySignatureStructure(
    currentFile: SourceFile,
    key: string,
    property: JSONSchema,
    required: boolean,
  ): OptionalKind<PropertySignatureStructure> {
    const propertyStructure: OptionalKind<PropertySignatureStructure> = {
      name: TypescriptInterfaceGenerator.coercePropertyKey(key),
      type: this.propertyTypeWriteFunction(currentFile, property, key),
      hasQuestionToken: !required,
    };

    if (property.description) {
      propertyStructure.docs = [ property.description ];
    }

    return propertyStructure;
  }

  private recordType(
    propertyType: string | WriterFunction,
    keyType: 'string' | 'number' | 'boolean' = 'string',
  ): WriterFunction {
    return (writer) => {
      writer.write('Record<');
      writer.write(keyType);
      writer.write(',');
      if (typeof propertyType === 'string') {
        writer.write(propertyType);
      } else {
        propertyType(writer);
      }
      writer.write('>');
    };
  }

  private propertyTypeWriteFunction(
    currentFile: SourceFile,
    schema: JSONSchema,
    propertyName: string,
  ): WriterFunction | string {
    // convert to any to support non-standard types like int, unknown, file, etc.
    switch (schema.type as any) {
      case 'string':
        if (schema.enum) {
          const isStringArray = (array: any[]): array is string[] => {
            return array.every((item) => typeof item === 'string');
          };
          const isNumberArray = (array: any[]): array is number[] => {
            return array.every((item) => typeof item === 'number');
          };
          if (isStringArray(schema.enum)) {
            if (schema.enum.every(item => item.match(/\d+/))) {
              return TypescriptInterfaceGenerator.unionType(schema.enum);
            } else {
              currentFile.addEnum({
                name: classify(propertyName) + 'Enum',
                isExported: true,
                members: schema.enum.map(item => ({
                  name: underscore(item).toUpperCase(),
                  value: item,
                })),
              });
              return classify(propertyName) + 'Enum';
            }
          }
          if (isNumberArray(schema.enum)) {
            return TypescriptInterfaceGenerator.unionType(schema.enum.map(item => item.toFixed(0)));
          }
          return TypescriptInterfaceGenerator.unionType(
            (schema.enum as string[]).map(
              (item) => (writer) => writer.quote(item),
            ),
          );
        }

        return 'string';

      case 'integer':
      case 'int':
      case 'number':
        return 'number';

      case 'boolean':
        return 'boolean';

      case 'null':
        return 'null';

      case 'any':
        return 'any';

      case 'unknown':
        return 'unknown';

      case 'array':
        if (schema.items) {
          const items = schema.items;

          if (!Array.isArray(items) && items !== true) {
            return (writer) => {
              writer.write('Array<');
              const type = this.propertyTypeWriteFunction(currentFile, items, propertyName);

              if (typeof type === 'string') {
                writer.write(type);
              } else if (type === undefined) {
                writer.write('unknown');
              } else {
                type(writer);
              }
              writer.write('>');
            };
          }
        }

        return 'Array<unknown>';

      case 'object':
      case undefined:
        if (
          schema.properties ||
          schema.additionalProperties ||
          schema.patternProperties
        ) {
          const objectTypeStructure: TypeElementMemberedNodeStructure = {
            properties: [],
          };

          if (schema.properties) {
            for (const [ key, property ] of Object.entries(
              schema.properties as Record<string, JSONSchema>,
            )) {
              objectTypeStructure.properties?.push(
                this.buildPropertySignatureStructure(
                  currentFile,
                  key,
                  property,
                  TypescriptInterfaceGenerator.isRequired(schema, key),
                ),
              );
            }
          }

          if (
            schema.patternProperties &&
            Object.keys(schema.patternProperties).length
          ) {
            const typeList: Array<string | WriterFunction> = [];
            for (const [ key, property ] of Object.entries(
              schema.patternProperties as Record<string, JSONSchema>,
            )) {
              typeList.push(
                this.propertyTypeWriteFunction(currentFile, property, propertyName),
              );
            }
            if (schema.properties && Object.keys(schema.properties).length) {
              return Writers.intersectionType(
                Writers.objectType(objectTypeStructure),
                this.recordType(typeList.shift()!),
                ...typeList.map((type) => this.recordType(type)),
              );
            } else {
              return TypescriptInterfaceGenerator.intersectionType(
                typeList.map((type) => this.recordType(type)),
              );
            }
          }

          if (schema.additionalProperties) {
            let type: string | WriterFunction = 'Record<string, unknown>';
            if (schema.additionalProperties !== true) {
              type = this.propertyTypeWriteFunction(
                currentFile,
                schema.additionalProperties,
                propertyName,
              );
            }
            if (schema.properties && Object.keys(schema.properties).length) {
              return Writers.intersectionType(
                Writers.objectType(objectTypeStructure),
                this.recordType(type),
              );
            } else {
              return this.recordType(type);
            }
          }

          return Writers.objectType(objectTypeStructure);
        } else if (schema.$ref) {
          const name = this.resolveRefName(schema.$ref);

          this.addType(this.resolveRef(schema.$ref), name);

          if (
            this.options.addImports &&
            currentFile.getBaseNameWithoutExtension() !== this.getFileName(name)
          ) {
            this.importList.push({
              name: this.buildName(name),
              moduleSpecifier: `./${ this.getFileName(name) }`,
            });
          }

          return this.buildName(name);
        } else if (schema.oneOf) {
          const typeList: Array<WriterFunction | string> = [];

          for (const oneOf of schema.oneOf) {
            if (typeof oneOf !== 'boolean') {
              typeList.push(this.propertyTypeWriteFunction(currentFile, oneOf, propertyName));
            }
          }

          return TypescriptInterfaceGenerator.unionType(typeList);
        } else if (schema.anyOf) {
          const typeList: Array<WriterFunction | string> = [];

          for (const oneOf of schema.anyOf) {
            if (typeof oneOf !== 'boolean') {
              typeList.push(this.propertyTypeWriteFunction(currentFile, oneOf, propertyName));
            }
          }

          return TypescriptInterfaceGenerator.unionType(typeList);
        } else if (schema.allOf) {
          const typeList: Array<WriterFunction | string> = [];

          for (const oneOf of schema.allOf) {
            if (typeof oneOf !== 'boolean') {
              typeList.push(this.propertyTypeWriteFunction(currentFile, oneOf, propertyName));
            }
          }

          return TypescriptInterfaceGenerator.intersectionType(typeList);
        } else if (schema.const) {
          return (writer) => writer.quote(schema.const);
        } else if (schema.type === 'object') {
          return w => w.write('Record<string, unknown>');
        }

        console.warn(
          `The property type is undefined and a ref is not defined! found: ${ Object.keys(
            schema,
          ) }`,
        );

        return 'unknown';

      case 'file':
        return 'Buffer';

      default:
        if (Array.isArray(schema.type)) {
          const primitiveTypeList = schema.type.filter((type: string) =>
            [ 'string', 'integer', 'number', 'boolean', 'null', 'any', 'unknown' ].includes(
              type,
            ),
          );
          const complexTypeList = schema.type.filter(
            (type: string) =>
              ![
                'string',
                'integer',
                'number',
                'boolean',
                'null',
                'any',
                'unknown',
              ].includes(type),
          );

          const typeList: Array<WriterFunction | string> = primitiveTypeList;

          for (const type of complexTypeList) {
            typeList.push(
              this.propertyTypeWriteFunction(currentFile,
                {
                  ...schema,
                  type: type as any,
                },
                propertyName,
              ),
            );
          }

          return TypescriptInterfaceGenerator.unionType(typeList);
        }

        throw new Error(`The property type '${ schema.type }' is not supported!`);
    }
  }

  private getFileName(name: string): string {
    if (this.options.suffix) {
      return [ dasherize(name), dasherize(this.options.suffix) ].join('.');
    }
    return dasherize(name);
  }

  private buildName(name: string): string {
    if (this.options.suffix) {
      return classify([ name, this.options.suffix ].join('-'));
    }
    return classify(name);
  }

  private resolveRefName(ref: string): string {
    const nameMatch = ref.match(/\/([^/]+)$/);

    if (!nameMatch) {
      throw new Error(`Could not resolve ref name '${ ref }'`);
    }

    return nameMatch[1];
  }

  private resolveRef(ref: string): JSONSchema {
    const path = ref.split('/');

    // remove the prefix '#'
    path.shift();

    const schema: JSONSchema | undefined = getFromObject(
      this.bundledSchema,
      path.join('.'),
    );

    if (!schema) {
      throw new Error(`Could not resolve $ref '${ ref }'.`);
    }

    return schema;
  }

  public async bundleSchema(): Promise<void> {
    if (!this.bundledSchema) {
      this.bundledSchema = await TypescriptInterfaceGenerator.bundleSchema(this.schema, this.options);
    }
  }
}
