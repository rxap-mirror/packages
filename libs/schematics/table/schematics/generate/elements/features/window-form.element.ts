import {
  ParsedElement,
  ElementFactory
} from '@rxap/xml-parser';
import {
  ElementDef,
  ElementChildTextContent,
  ElementChild,
  ElementRequired,
  ElementChildRawContent
} from '@rxap/xml-parser/decorators';
import { SubmitHandleMethod } from '@rxap/schematics-form/schematics/generate/elements/form.element';
import { CreateButtonElement } from './create-button.element';
import { EditActionElement } from './action-buttons/edit-action.element';
import {
  ModuleElement,
  MethodElement,
  ToValueContext,
  AddComponentProvider
} from '@rxap/schematics-utilities';
import { strings } from '@angular-devkit/core';
import { join } from 'path';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { GenerateSchema } from '../../schema';
import { Writers } from 'ts-morph';

const { dasherize, classify, camelize } = strings;

@ElementDef('window-form')
export class WindowFormElement implements ParsedElement {

  public __parent!: CreateButtonElement | EditActionElement;

  @ElementChildRawContent()
  public template?: string;

  @ElementChildTextContent()
  public name?: string;

  @ElementChildTextContent()
  public form?: string;

  @ElementChild(SubmitHandleMethod)
  @ElementRequired()
  public submit!: SubmitHandleMethod;

  @ElementChildTextContent()
  @ElementRequired()
  public title!: string;

  public postParse() {

    if (!this.name) {
      let suffix: string = '';
      if (this.__parent.__tag === 'create-button') {
        suffix = '-create';
      }
      if (this.__parent.__tag === 'edit-action') {
        suffix = '-edit';
      }
      this.name = dasherize(this.__parent.__parent.id) + suffix;
    }

    this.__parent.module = ElementFactory(ModuleElement, {
      name: classify(this.name) + 'FormComponentModule',
      form: './' + join(dasherize(this.name) + '-form', dasherize(this.name) + '-form.component.module')
    });
    this.__parent.method = ElementFactory(MethodElement, {
      name: 'Open' + classify(this.name) + 'FormWindowMethod',
      from: './' + join(dasherize(this.name) + '-form', 'open-' + dasherize(this.name) + '-form-window.method')
    });
    if (!this.template) {
      this.template = join('views', 'forms', dasherize(this.form ?? this.__parent.__parent.id) + '.xml');
    }
  }

  public toValue({ options, project }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      externalSchematic(
        '@rxap/schematics-form',
        'generate-view',
        {
          path:             options.path?.replace(/^\//, ''),
          template:         this.template,
          name:             this.name,
          project:          options.project,
          organizeImports:  false,
          fixImports:       false,
          format:           false,
          templateBasePath: options.templateBasePath,
          overwrite:        options.overwrite,
          openApiModule:    options.openApiModule
        }
      ),
      tree => {

        const formComponentFilePath = join(
          dasherize(this.name!) + '-form',
          dasherize(this.name!) + '-form.component.ts'
        );

        if (!tree.exists(join(options.path!, formComponentFilePath))) {
          console.log('Table window form component path: ' + join(options.path!, formComponentFilePath));
          throw new Error('The table window form component is not generated');
        }

        const sourceFile = project.getSourceFile(formComponentFilePath) ??
                           project.createSourceFile(formComponentFilePath, tree.read(join(options.path!, formComponentFilePath))!.toString());

        AddComponentProvider(
          sourceFile,
          {
            provide:  'RXAP_WINDOW_SETTINGS',
            useValue: Writers.object({
              title: `$localize\`:@@form.${dasherize(this.name!)}.window.title:${this.title}\``
            })
          },
          [
            {
              namedImports:    [ 'RXAP_WINDOW_SETTINGS' ],
              moduleSpecifier: '@rxap/window-system'
            }
          ],
          options.overwrite
        );

        this.submit.handleComponent({ project, sourceFile, options });

      }
    ]);
  }

  public validate(): boolean {
    return !!this.template;
  }

}
