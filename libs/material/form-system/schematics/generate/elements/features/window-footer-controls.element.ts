import {
  ElementDef,
  ElementExtends,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport,
  AddComponentProvider
} from '@rxap-schematics/utilities';
import {
  SourceFile,
  Scope,
  Writers
} from 'ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { FormFeatureElement } from './form-feature.element';
import { GenerateSchema } from '../../schema';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(FormFeatureElement)
@ElementDef('window-footer-controls')
export class WindowFooterControlsElement extends FormFeatureElement {

  @ElementAttribute()
  public allowResubmit?: boolean;

  public template(): string {
    const attributes: Array<string | (() => string)> = [ '(close)="windowRef.close($event)"' ];
    if (this.allowResubmit) {
      attributes.push('allowResubmit');
    }
    return NodeFactory('ng-template', 'rxapFormWindowFooter', 'let-windowRef')([
      NodeFactory('rxap-form-controls', ...attributes)()
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'FormWindowFooterDirectiveModule', '@rxap/form-window-system');
    AddNgModuleImport(sourceFile, 'FormControlsComponentModule', '@rxap-material/form-system');
  }


  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, sourceFile, options });
    if (this.__parent.title) {
      if (!sourceFile.getFunction('WindowOptionsFactory')) {
        sourceFile.addFunction({
          name:       'WindowOptionsFactory',
          isExported: true,
          statements: [
            w => {
              w.write('return ');
              Writers.object({
                title: `$localize\`:@@form.${dasherize(this.__parent.name)}.window.title:${this.__parent.title}\``
              })(w);
              w.write(';');
            }
          ]
        });
      }
      AddComponentProvider(
        sourceFile,
        {
          provide:    'RXAP_WINDOW_SETTINGS',
          useFactory: 'WindowOptionsFactory',
          deps:       []
        },
        [
          {
            namedImports:    [ 'RXAP_WINDOW_SETTINGS' ],
            moduleSpecifier: '@rxap/window-system'
          }
        ]
      );
    }
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return tree => {

      const openFormMethodFilePath = `open-${dasherize(options.name!)}-form-window.method.ts`;
      if (!project.getSourceFile(openFormMethodFilePath)) {
        const sourceFile = project.createSourceFile(openFormMethodFilePath);
        sourceFile.addClass({
          isExported: true,
          name:       `Open${classify(options.name!)}FormWindowMethod`,
          extends:    `OpenFormWindowMethod<I${classify(options.name!)}Form>`,
          decorators: [
            {
              name:      'Injectable',
              arguments: []
            }
          ],
          ctors:      [
            {
              parameters: [
                {
                  name:       'formWindowService',
                  type:       'FormWindowService',
                  decorators: [
                    {
                      name:      'Inject',
                      arguments: [ 'FormWindowService' ]
                    }
                  ]
                },
                {
                  name:       'injector',
                  type:       'Injector',
                  decorators: [
                    {
                      name:      'Inject',
                      arguments: [ 'INJECTOR' ]
                    }
                  ]
                },
                {
                  name:       'defaultOptions',
                  type:       `FormWindowOptions<I${classify(options.name!)}Form> | null`,
                  decorators: [
                    {
                      name:      'Optional',
                      arguments: []
                    },
                    {
                      name:      'Inject',
                      arguments: [ 'RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS' ]
                    }
                  ]
                },
              ],
              statements: [
                `super(formWindowService, ${classify(options.name!)}Form, injector, ${classify(options.name!)}FormComponent, defaultOptions)`
              ]
            }
          ]
        });
        sourceFile.addImportDeclarations([
          {
            namedImports:    [ 'OpenFormWindowMethod', 'FormWindowService', 'FormWindowOptions', 'RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS' ],
            moduleSpecifier: '@rxap/form-window-system'
          },
          {
            namedImports:    [ `${classify(options.name!)}Form`, `I${classify(options.name!)}Form` ],
            moduleSpecifier: `./${dasherize(options.name!)}.form`
          },
          {
            namedImports:    [ 'Inject', 'Optional', 'Injectable', 'INJECTOR', 'Injector' ],
            moduleSpecifier: '@angular/core'
          }
        ]);
      }
      const openFormMethodDirectiveFilePath = `open-${dasherize(options.name!)}-form-window.directive.ts`;
      if (!project.getSourceFile(openFormMethodDirectiveFilePath)) {
        const sourceFile = project.createSourceFile(openFormMethodDirectiveFilePath);
        sourceFile.addImportDeclarations([
          {
            namedImports:    [ 'NgModule', 'Directive', 'Input' ],
            moduleSpecifier: '@angular/core'
          },
          {
            namedImports:    [ 'MethodDirective' ],
            moduleSpecifier: '@mfd/shared/method.directive'
          },
          {
            namedImports:    [ `${classify(options.name!)}Form`, `I${classify(options.name!)}Form` ],
            moduleSpecifier: `./${dasherize(options.name!)}.form`
          },
          {
            namedImports:    [ `Open${classify(options.name!)}FormWindowMethod` ],
            moduleSpecifier: `./${openFormMethodFilePath.replace(/\.ts$/, '')}`
          },
          {
            namedImports:    [ `${classify(options.name!)}FormComponentModule` ],
            moduleSpecifier: `./${dasherize(options.name!)}-form.component.module`
          }
        ]);
        sourceFile.addClass({
          name:       `Open${classify(options.name!)}FormWindowMethodDirective`,
          isExported: true,
          extends:    `MethodDirective<I${classify(options.name!)}Form, Partial<I${classify(options.name!)}Form>>`,
          properties: [
            {
              name:             'parameters',
              hasQuestionToken: true,
              type:             `Partial<I${classify(options.name!)}Form>`,
              decorators:       [
                {
                  name:      'Input',
                  arguments: [ w => w.quote('initial') ]
                }
              ]
            }
          ],
          ctors:      [
            {
              parameters: [
                {
                  name:       'method',
                  isReadonly: true,
                  scope:      Scope.Public,
                  type: `Open${classify(options.name!)}FormWindowMethod`
                }
              ],
              statements: [ 'super();' ]
            }
          ],
          decorators: [
            {
              name:      'Directive',
              arguments: [
                Writers.object({
                  selector: w => w.quote(`[mfdOpen${classify(options.name!)}FormWindow]`)
                })
              ]
            }
          ]
        });
        sourceFile.addClass({
          name:       `Open${classify(options.name!)}FormWindowMethodDirectiveModule`,
          isExported: true,
          decorators: [
            {
              name:      'NgModule',
              arguments: [
                Writers.object({
                  imports:      `[${classify(options.name!)}FormComponentModule]`,
                  exports:      `[Open${classify(options.name!)}FormWindowMethodDirective]`,
                  declarations: `[Open${classify(options.name!)}FormWindowMethodDirective]`,
                  providers:    `[Open${classify(options.name!)}FormWindowMethod]`
                })
              ]
            }
          ]
        });
      }

    };
  }

}
