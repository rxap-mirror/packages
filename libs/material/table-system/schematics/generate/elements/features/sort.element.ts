import { FeatureElement } from './feature.element';
import {
  ElementDef,
  ElementExtends
} from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';
import {
  AddNgModuleImport,
  ToValueContext
} from '@rxap-schematics/utilities';

@ElementExtends(FeatureElement)
@ElementDef('sort')
export class SortElement extends FeatureElement {

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'MatSortModule', '@angular/material/sort');
  }

  public tableTemplate(): string {
    return 'matSort';
  }

}
