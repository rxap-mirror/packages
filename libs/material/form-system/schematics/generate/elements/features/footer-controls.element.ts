import { FormFeatureElement } from './form-feature.element';
import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent,
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
  Writers
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { FormElement } from '../form.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(FormFeatureElement)
@ElementDef('footer-controls')
export class FooterControlsElement extends FormFeatureElement {

  public __parent!: FormElement;

  @ElementChildTextContent()
  public navigateAfterSubmit?: string;

  @ElementAttribute()
  public allowResubmit?: boolean;

  public template(): string {
    const attributes: Array<string | (() => string)> = [];
    if (this.navigateAfterSubmit !== undefined) {
      attributes.push(`[navigateAfterSubmit]="[ '${this.navigateAfterSubmit}' ]"`);
    }
    if (this.allowResubmit) {
      attributes.push('allowResubmit');
    }
    return NodeFactory('ng-template', 'rxapFooter')([
      NodeFactory('rxap-form-controls', ...attributes)()
    ]);
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

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'FooterDirectiveModule', '@rxap/layout');
    AddNgModuleImport(sourceFile, 'FormControlsComponentModule', '@rxap-material/form-system');
  }

}
