import {
  ElementDef,
  ElementChildren,
  ElementAttribute,
  ElementRequired,
  ElementTextContent,
  ElementChild
} from '@rxap/xml-parser/decorators';
import { ControlElement } from './control.element';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ClassDeclaration,
  Scope,
  SourceFile,
  Project,
  VariableDeclarationKind,
  Writers
} from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { FeatureElement } from './features/feature.element';
import {
  AddToFormProviders,
  GetFormProvidersFile,
  MethodElement,
  ToValueContext,
  AddVariableProvider
} from '@rxap-schematics/utilities';
import { Rule } from '@angular-devkit/schematics';
import { GenerateSchema } from '../schema';
import { HandleFormProviders } from './types';

const { dasherize, classify, camelize } = strings;

@ElementDef('adapter')
export class FormHandlerAdapterElement implements ParsedElement<Rule>, HandleFormProviders {

  @ElementTextContent()
  public name!: string;

  @ElementAttribute()
  public from!: string;

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return () => {};
  }

  public handleFormProviders({ options, project, sourceFile }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.from) {
      sourceFile.addImportDeclaration({
        moduleSpecifier: this.from,
        namedImports:    [ this.name ]
      });
    }
  }

}

export abstract class FormHandleMethodElement implements ParsedElement<Rule>, HandleFormProviders {

  public abstract type: string;

  @ElementChild(MethodElement)
  @ElementRequired()
  public method!: MethodElement;

  @ElementChild(FormHandlerAdapterElement)
  public adapter?: FormHandlerAdapterElement;

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return () => {};
  }

  public handleFormProviders({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.adapter) {
      this.adapter.handleFormProviders({ project, sourceFile, options });
      AddVariableProvider(
        sourceFile,
        'FormComponentProviders',
        {
          provide:    this.type,
          useFactory: this.adapter.name,
          deps:       [ this.method.toValue({ sourceFile, project, options }) ]
        },
        [
          {
            namedImports:    [ this.type ],
            moduleSpecifier: '@rxap/forms'
          }
        ]
      );
    } else {
      AddVariableProvider(
        sourceFile,
        'FormComponentProviders',
        {
          provide:  this.type,
          useClass: this.method.toValue({ sourceFile, project, options })
        },
        [
          {
            namedImports:    [ this.type ],
            moduleSpecifier: '@rxap/forms'
          }
        ]
      );
    }
  }

}

@ElementDef('submit')
export class SubmitHandleMethod extends FormHandleMethodElement {

  public type: string = 'RXAP_FORM_SUBMIT_METHOD';

}

@ElementDef('load')
export class LoadHandleMethod extends FormHandleMethodElement {

  public type: string = 'RXAP_FORM_LOAD_METHOD';

}

@ElementDef('definition')
export class FormElement implements ParsedElement<ClassDeclaration> {

  @ElementChildren(ControlElement, { group: 'controls' })
  @ElementRequired()
  public controls: ControlElement[] = [];

  @ElementChildren(FeatureElement, { group: 'features' })
  public features: FeatureElement[] = [];

  @ElementChild(SubmitHandleMethod)
  public submit?: SubmitHandleMethod;

  @ElementChild(LoadHandleMethod)
  public load?: LoadHandleMethod;

  @ElementAttribute()
  @ElementRequired()
  public id!: string;

  public validate(): boolean {
    return this.controls.length !== 0;
  }

  private addFormInterface(
    formInterfaceName: string,
    sourceFile: SourceFile
  ) {

    let interfaceDeclaration = sourceFile.getInterface(formInterfaceName);

    if (!interfaceDeclaration) {
      interfaceDeclaration = sourceFile.addInterface({
        name:       formInterfaceName,
        isExported: true
      });
    }

    for (const control of this.controls) {
      const propertyName = camelize(control.id);
      const property     = interfaceDeclaration.getProperty(propertyName);
      if (property) {
        property.setType(control.getType());
      } else {
        interfaceDeclaration.addProperty({
          name: propertyName,
          type: control.getType()
        });
      }
    }

  }

  private addToFormProviders(formName: string, project: Project, namedImports: string[] = [ formName ]): void {

    const formProviderSourceFile = AddToFormProviders(project, formName);

    formProviderSourceFile.addImportDeclaration({
      moduleSpecifier: `./${dasherize(this.id)}.form`,
      namedImports:    namedImports
    });

  }

  private addFormComponentProviders(project: Project): void {

    const formProviderSourceFile = GetFormProvidersFile(project);

    if (!formProviderSourceFile.getVariableStatement('FormComponentProviders')) {
      formProviderSourceFile.addVariableStatement({
        isExported:      true,
        declarationKind: VariableDeclarationKind.Const,
        declarations:    [
          {
            name:        'FormComponentProviders',
            initializer: writer => {

              writer.writeLine('[');

              Writers.object({
                provide:    'RXAP_FORM_DEFINITION',
                useFactory: 'FormFactory',
                deps:       `[ INJECTOR, [new Optional(), RXAP_FORM_INITIAL_STATE] ]`
              })(writer);

              writer.write(']');

            },
            type:        'Provider[]'
          }
        ]
      });
      const formName = classify(this.id) + 'Form';
      formProviderSourceFile.addImportDeclarations([
        {
          moduleSpecifier: '@rxap/forms',
          namedImports:    [ 'RXAP_FORM_DEFINITION', 'RXAP_FORM_INITIAL_STATE', 'RxapFormBuilder' ]
        },
        {
          moduleSpecifier: '@angular/core',
          namedImports:    [ 'INJECTOR', 'Injector', 'Optional' ]
        },
        {
          moduleSpecifier: `./${dasherize(this.id)}.form`,
          namedImports:    [ 'I' + formName ]
        }
      ]);
      formProviderSourceFile.addFunction({
        isExported: true,
        name:       'FormFactory',
        parameters: [
          {
            name: 'injector',
            type: 'Injector'
          },
          {
            name: 'state',
            type: `I${formName} | null`
          }
        ],
        // TODO : add return type
        returnType: formName,
        statements: [
          `return new RxapFormBuilder(${formName}, injector).build(state ?? {});`
        ]
      });
    }

  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {

    const formName          = classify(this.id) + 'Form';
    const formInterfaceName = 'I' + formName;

    this.addFormInterface(formInterfaceName, sourceFile);
    this.addToFormProviders(formName, project);
    this.addFormComponentProviders(project);

    this.submit?.handleFormProviders({ project, options, sourceFile: GetFormProvidersFile(project) });
    this.load?.handleFormProviders({ project, options, sourceFile: GetFormProvidersFile(project) });

    let classDeclaration = sourceFile.getClass(formName);

    if (!classDeclaration) {
      classDeclaration = sourceFile.addClass({
        name:       formName,
        isExported: true,
        implements: [ `FormType<${formInterfaceName}>` ],
        decorators: [
          {
            name:      'Injectable',
            arguments: []
          },
          {
            name:      'RxapForm',
            arguments: [ writer => writer.quote(this.id) ]
          }
        ],
        properties: [
          {
            name:                'rxapFormGroup',
            scope:               Scope.Public,
            hasExclamationToken: true,
            type:                `RxapFormGroup<${formInterfaceName}>`
          }
        ]
      });
      sourceFile.addImportDeclarations([
        {
          moduleSpecifier: '@angular/core',
          namedImports:    [ 'Injectable' ]
        },
        {
          moduleSpecifier: '@rxap/forms',
          namedImports:    [ 'RxapForm', 'FormType', 'RxapFormGroup' ]
        }
      ]);
    }

    for (const control of this.controls) {
      control.toValue({ classDeclaration, sourceFile, project, options });
    }

    for (const feature of this.features) {
      feature.toValue({ classDeclaration, sourceFile, project, options });
    }

    return classDeclaration;

  }

}
