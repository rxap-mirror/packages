import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
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

  public template(): string {
    return NodeFactory('ng-template', 'rxapFormWindowFooter', 'let-windowRef')([
      NodeFactory('rxap-form-controls', '(close)="windowRef.close($event)"')()
    ]);
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'FormWindowFooterDirectiveModule', '@rxap/form-window-system');
    AddNgModuleImport(sourceFile, 'FormControlsComponentModule', '@rxap-material/form-system');
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
            namedImports:    [ 'Inject', 'Optional', 'Injectable', 'INJECTOR', 'Injector', 'NgModule' ],
            moduleSpecifier: '@angular/core'
          },
          {
            namedImports:    [ 'MethodDirective' ],
            moduleSpecifier: '@mfd/shared/method.directive'
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
                  type:       'OpenDataTriggerCreateFormWindowMethod'
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
                  exports:      `[Open${classify(options.name!)}WindowMethodDirective]`,
                  declarations: `[Open${classify(options.name!)}FormWindowMethodDirective]`
                })
              ]
            }
          ]
        });
      }

    };
  }

}
