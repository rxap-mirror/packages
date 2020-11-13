import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  NodeFactory,
  ToValueContext,
  AddNgModuleImport
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';
import { Rule } from '@angular-devkit/schematics';
import { strings } from '@angular-devkit/core';
import { FormFeatureElement } from './form-feature.element';

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

  public toValue({ project, options }: ToValueContext): Rule {
    return tree => {

      const openFormMethodFilePath = `open-${dasherize(this.__parent.name)}-form-window.method.ts`;
      if (!project.getSourceFile(openFormMethodFilePath)) {
        const sourceFile = project.createSourceFile(openFormMethodFilePath);
        sourceFile.addClass({
          isExported: true,
          name:       `Open${classify(this.__parent.name)}FormWindowMethod`,
          extends:    'OpenFormWindowMethod',
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
                  name:        'defaultOptions',
                  type:        `FormWindowOptions<I${classify(this.__parent.name)}Form> | null`,
                  initializer: 'null',
                  decorators:  [
                    {
                      name:      'Optional',
                      arguments: []
                    },
                    {
                      name:      'Inject',
                      arguments: [ 'RXAP_FORM_WINDOW_SYSTEM_OPEN_FORM_DEFAULT_OPTIONS' ]
                    }
                  ]
                }
              ],
              statements: [
                `super(formWindowService, ${classify(this.__parent.name)}Form, ${classify(this.__parent.name)}FormComponent, defaultOptions)`
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
            namedImports:    [ `${classify(this.__parent.name)}Form`, `I${classify(this.__parent.name)}Form` ],
            moduleSpecifier: `./${dasherize(this.__parent.name)}.form`
          },
          {
            namedImports:    [ 'Inject', 'Optional', 'Injectable' ],
            moduleSpecifier: '@angular/core'
          }
        ]);
      }

    };
  }

}
