import { ParsedElement, ParsedElementType } from '@rxap/xml-parser';
import { getExtendedTypes } from './get-extended-types';

export function isTypeOf<
  Source extends ParsedElement,
  Target extends ParsedElement
>(
  source: ParsedElementType<Source>,
  target: ParsedElementType<Target>
): boolean {
  // @ts-expect-error the function checks is this types are equal
  if (source === target) {
    return true;
  }

  return (
    getExtendedTypes(target)
      // @ts-expect-error the function checks is this types are equal
      .some((type) => type === source)
  );
}
