import {
  ValidatorElement,
  ValidatorToValueContext
} from './validator.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';

@ElementExtends(ValidatorElement)
@ElementDef('is-number')
export class IsNumberElement extends ValidatorElement {

  public validator = 'IsNumber';

  public toValue({ controlOptions, project, options, sourceFile }: ValidatorToValueContext): any {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@rxap/forms',
      namedImports:    [ 'IsNumber' ]
    });
    return super.toValue({ controlOptions, project, options, sourceFile });
  }

}
