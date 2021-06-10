import { ControlElement } from './control.element';
import {
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
} from '@rxap/xml-parser/decorators';
import { NodeElement } from '../node.element';
import { ToValueContext, AddNgModuleImport } from '@rxap/schematics-ts-morph';
import { SourceFile, Scope, Writers } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { chain, Rule, externalSchematic } from '@angular-devkit/schematics';
import { join } from 'path';
import { GenerateSchema } from '../../schema';
import { PermissionsElement } from './features/permissions.element';
import { NodeFactory } from '@rxap/schematics-html';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('component-control')
export class ComponentControlElement extends ControlElement {
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
      this.componentName = classify(this.name);
    }
    if (!this.componentModuleName) {
      this.createComponent = true;
      this.componentModuleName = `${this.componentName}ControlComponentModule`;
    }
    if (!this.selector) {
      this.selector = `rxap-${dasherize(this.componentName)}-control`;
    }
    if (!this.from) {
      this.from = `./${dasherize(this.componentName)}-control/${dasherize(
        this.componentName
      )}-control.component.module`;
    }
    if (!this.componentModuleName) {
      this.componentModuleName = `${this.componentName}Module`;
    }
  }

  public template(): string {
    const attributes: Array<string | (() => string)> = [
      `formControlName="${this.name}"`,
      `data-cy="form.${this.controlPath}"`,
    ];
    if (this.hasFeature('permissions')) {
      const permissionsElement =
        this.getFeature<PermissionsElement>('permissions');
      attributes.push(
        ...permissionsElement.getAttributes(
          ['form', this.controlPath].join('.')
        )
      );
    }
    let node = NodeFactory(
      this.selector,
      this.flexTemplateAttribute,
      ...attributes,
      ...this.attributes
    )(`\n<ng-container i18n>${capitalize(this.name)}</ng-container>\n`);
    if (this.hasFeature('permissions')) {
      const permissionsElement =
        this.getFeature<PermissionsElement>('permissions');
      node = permissionsElement.wrapNode(
        node,
        ['form', this.controlPath].join('.')
      );
    }

    return node;
  }

  public handleComponentModule({
    project,
    sourceFile,
    options,
  }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    AddNgModuleImport(sourceFile, this.componentModuleName, this.from);
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    const rules: Rule[] = [super.toValue({ project, options })];
    if (this.createComponent) {
      rules.push((tree) => {
        const componentModulePath = join(options.path ?? '', this.from + '.ts');
        if (!tree.exists(componentModulePath)) {
          return chain([
            externalSchematic('@rxap/schematics', 'component-module', {
              name: dasherize(this.componentName) + '-control',
              path: options.path?.replace(/^\//, ''),
              selector: this.selector,
              project: options.project,
            }),
            (tree) => {
              const componentSourceFile = project.createSourceFile(
                `./${dasherize(this.componentName)}-control/${dasherize(
                  this.componentName
                )}-control.component.ts`
              );

              componentSourceFile.addClass({
                name: this.componentName + 'ControlComponent',
                extends: 'ControlValueAccessor',
                properties: [
                  {
                    name: 'value',
                    scope: Scope.Public,
                    type: 'any | null',
                    initializer: 'null',
                  },
                ],
                methods: [
                  {
                    name: 'writeValue',
                    parameters: [
                      {
                        name: 'value',
                        type: 'any | null',
                      },
                    ],
                    scope: Scope.Public,
                    returnType: 'void',
                    statements: ['this.value = value;'],
                  },
                ],
                isExported: true,
                decorators: [
                  {
                    name: 'Component',
                    arguments: [
                      Writers.object({
                        selector: (w) => w.quote(this.selector),
                        templateUrl: (w) =>
                          w.quote(
                            `./${dasherize(
                              this.componentName
                            )}-control.component.html`
                          ),
                        styleUrls: `[ './${dasherize(
                          this.componentName
                        )}-control.component.scss' ]`,
                        changeDetection: 'ChangeDetectionStrategy.OnPush',
                        host: Writers.object({
                          class: (w) =>
                            w.quote(
                              `rxap-${dasherize(this.componentName)}-control`
                            ),
                        }),
                        providers: (w) => {
                          w.writeLine('[');
                          Writers.object({
                            provide: 'NG_VALUE_ACCESSOR',
                            multi: 'true',
                            useExisting: `forwardRef(() => ${this.componentName}ControlComponent)`,
                          })(w);
                          w.write(']');
                        },
                      }),
                    ],
                  },
                ],
              });

              componentSourceFile.addImportDeclarations([
                {
                  namedImports: ['ControlValueAccessor'],
                  moduleSpecifier: '@rxap/forms',
                },
                {
                  namedImports: ['NG_VALUE_ACCESSOR'],
                  moduleSpecifier: '@angular/forms',
                },
                {
                  namedImports: [
                    'Component',
                    'ChangeDetectionStrategy',
                    'forwardRef',
                  ],
                  moduleSpecifier: '@angular/core',
                },
              ]);
            },
          ]);
        } else {
          console.log(
            `The component module '${componentModulePath}' already exists!`
          );
        }
      });
    }
    return chain(rules);
  }
}
