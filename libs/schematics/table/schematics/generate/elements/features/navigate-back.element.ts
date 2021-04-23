import { FeatureElement } from './feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap/schematics-ts-morph';

@ElementExtends(FeatureElement)
@ElementDef('navigate-back')
export class NavigateBackElement extends FeatureElement {

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'FlexLayoutModule', '@angular/flex-layout');
    AddNgModuleImport(sourceFile, 'MatDividerModule', '@angular/material/divider');
    AddNgModuleImport(sourceFile, 'NavigateBackButtonComponentModule', '@rxap/components');
  }

}
