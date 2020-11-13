import { FormFeatureElement } from './form-feature.element';
import {
  ElementDef,
  ElementChildTextContent,
  ElementAttribute,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import {
  SourceFile,
  Writers,
  WriterFunction
} from 'ts-morph';
import {
  ToValueContext,
  AddComponentProvider
} from '@rxap-schematics/utilities';

@ElementExtends(FormFeatureElement)
@ElementDef('form-field-default-options')
export class FormFieldDefaultOptionsElement extends FormFeatureElement {

  @ElementChildTextContent()
  public appearance?: 'legacy' | 'standard' | 'fill' | 'outline';

  @ElementAttribute()
  hideRequiredMarker?: boolean;

  @ElementChildTextContent()
  floatLabel?: 'always' | 'never' | 'auto';

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    const defaultOptions: Record<string, WriterFunction | string> = {};

    if (this.appearance) {
      defaultOptions.appearance = writer => writer.quote(this.appearance!);
    }

    if (this.hideRequiredMarker !== undefined) {
      defaultOptions.hideRequiredMarker = this.hideRequiredMarker ? 'true' : 'false';
    }

    if (this.floatLabel) {
      defaultOptions.floatLabel = writer => writer.quote(this.floatLabel!);
    }

    AddComponentProvider(
      sourceFile,
      {
        provide:  'MAT_FORM_FIELD_DEFAULT_OPTIONS',
        useValue: Writers.object(defaultOptions)
      },
      [
        {
          namedImports:    [ 'MAT_FORM_FIELD_DEFAULT_OPTIONS' ],
          moduleSpecifier: '@angular/material/form-field'
        }
      ]
    );
  }

}
