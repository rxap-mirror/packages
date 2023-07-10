import {ArrayLiteralExpression, ObjectLiteralExpression, PropertyAssignment} from 'ts-morph';

export function DefaultAddControlValidatorCompare(a: string, b: string): boolean {
  return a.trim().replace(/[\r\n\t]/g, '') === b.trim().replace(/[\r\n\t]/g, '');
}

export function AddControlValidator(
  validator: string,
  controlOptions: ObjectLiteralExpression,
  compareFn: (a: string, b: string) => boolean = DefaultAddControlValidatorCompare,
) {

  let validatorPropertyAssignment = controlOptions.getProperty('validators');

  if (!validatorPropertyAssignment) {
    validatorPropertyAssignment = controlOptions.addPropertyAssignment({
      name: 'validators',
      initializer: '[]',
    });
  }

  if (!(validatorPropertyAssignment instanceof PropertyAssignment)) {
    throw new Error('The validator property is not a assignment type!');
  }

  const validatorProperty = validatorPropertyAssignment.getInitializer();

  if (validatorProperty instanceof ArrayLiteralExpression) {
    const index = validatorProperty
      .getElements()
      .findIndex(element => compareFn(element.getFullText(), validator));
    if (index === -1) {
      validatorProperty.addElement(validator);
    } else {
      validatorProperty.removeElement(index);
      validatorProperty.insertElement(index, validator);
    }
  }

}
