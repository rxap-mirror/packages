import {
  ElementChildTextContent,
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-utilities';
import {
  SourceFile,
  Scope,
  Writers
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import {
  chain,
  Rule,
  externalSchematic
} from '@angular-devkit/schematics';
import { join } from 'path';
import { GenerateSchema } from '../../schema';
import { ArrayElement } from './array.element';
import { PermissionsElement } from './features/permissions.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('component-array')
export class ComponentArrayElement extends ArrayElement {

  @ElementChildTextContent('name')
  public componentName!: string;

  @ElementChildTextContent('module')
  public componentModuleName!: string;

  @ElementChildTextContent()
  public selector!: string;

  @ElementChildTextContent()
  public from!: string;

  public createComponent = false;

  public postParse() {
    if (!this.componentName) {
      this.createComponent     = true;
      this.componentName       = classify(this.name);
      this.selector            = `rxap-${dasherize(this.name)}-array-group`;
      this.from                = `./${dasherize(this.name)}-array-group/${dasherize(this.name)}-array-group.component.module`;
      this.componentModuleName = `${this.componentName}ArrayGroupComponentModule`;
    }
    if (!this.selector) {
      this.selector = `rxap-${dasherize(this.name)}-array-group`;
    }
    if (!this.from) {
      this.from = `./${dasherize(this.name)}-array-group/${dasherize(this.name)}-array-group.component.module`;
    }
    if (!this.componentModuleName) {
      this.componentModuleName = `${this.componentName}Module`;
    }
  }

  public template(): string {
    const attributes: Array<string | (() => string)> = [
      `formArrayName="${this.name}"`,
      `i18n="@@form.${this.controlPath}.label"`,
      `data-cy="form.${this.controlPath}"`
    ];
    if (this.hasFeature('permissions')) {
      const permissionsElement = this.getFeature<PermissionsElement>('permissions');
      attributes.push(...permissionsElement.getAttributes([ 'form', this.controlPath ].join('.')));
    }
    let node = NodeFactory(
      this.selector,
      this.flexTemplateAttribute,
      ...attributes,
      ...this.attributes
    )(`\n${capitalize(this.name)}\n`);
    if (this.hasFeature('permissions')) {
      const permissionsElement = this.getFeature<PermissionsElement>('permissions');
      node                     = permissionsElement.wrapNode(node, [ 'form', this.controlPath ].join('.'));
    }

    return node;
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, this.componentModuleName, this.from);
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    const rules: Rule[] = [
      super.toValue({ project, options })
    ];
    if (this.createComponent) {
      rules.push(tree => {

        const componentModulePath = join(options.path ?? '', this.from + '.ts');
        if (!tree.exists(componentModulePath)) {
          return chain([
              externalSchematic(
                '@rxap/schematics',
                'component-module',
                {
                  name:     dasherize(this.name) + '-array-group',
                  path:     options.path?.replace(/^\//, ''),
                  selector: this.selector,
                  project:  options.project
                }
              ),
              () => {

                const componentSourceFile = project.createSourceFile(`./${dasherize(this.name)}-array-group/${dasherize(this.name)}-array-group.component.ts`);

                componentSourceFile.addClass({
                  name:       this.componentName + 'ArrayGroupComponent',
                  extends:    'ControlValueAccessor',
                  properties: [
                    {
                      name:        'value',
                      scope:       Scope.Public,
                      type:        'any | null',
                      initializer: 'null'
                    }
                  ],
                  methods:    [
                    {
                      name:       'writeValue',
                      parameters: [
                        {
                          name: 'value',
                          type: 'any | null'
                        }
                      ],
                      scope:      Scope.Public,
                      returnType: 'void',
                      statements: [ 'this.value = value;' ]
                    }
                  ],
                  isExported: true,
                  decorators: [
                    {
                      name:      'Component',
                      arguments: [
                        Writers.object({
                          selector:        w => w.quote(this.selector),
                          templateUrl:     w => w.quote(`./${dasherize(this.name)}-array-group.component.html`),
                          styleUrls:       `[ './${dasherize(this.name)}-array-group.component.scss' ]`,
                          changeDetection: 'ChangeDetectionStrategy.OnPush',
                          host:            Writers.object({ class: w => w.quote(`rxap-${dasherize(name)}-array-group`) }),
                          providers:       w => {
                            w.writeLine('[');
                            Writers.object({
                              provide:     'NG_VALUE_ACCESSOR',
                              multi:       'true',
                              useExisting: `forwardRef(() => ${this.componentName}ArrayGroupComponent)`
                            })(w);
                            w.write(']');
                          }
                        })
                      ]
                    }
                  ]
                });

                componentSourceFile.addImportDeclarations([
                  {
                    namedImports:    [ 'ControlValueAccessor' ],
                    moduleSpecifier: '@rxap/forms'
                  },
                  {
                    namedImports:    [ 'NG_VALUE_ACCESSOR' ],
                    moduleSpecifier: '@angular/forms'
                  },
                  {
                    namedImports:    [ 'Component', 'ChangeDetectionStrategy', 'forwardRef' ],
                    moduleSpecifier: '@angular/core'
                  }
                ]);

              }
            ]
          );
        } else {
          console.log(`The component module '${componentModulePath}' already exists!`);
        }

      });
    }
    return chain(rules);
  }

}
