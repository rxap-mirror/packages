import {
  ValidatorElement,
  ValidatorToValueContext
} from './validator.element';

export class AngularValidatorElement extends ValidatorElement {

  public toValue({ controlOptions, project, options, sourceFile }: ValidatorToValueContext): any {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@angular/forms',
      namedImports:    [ 'Validators' ]
    });
    return super.toValue({ controlOptions, project, options, sourceFile });
  }

}
