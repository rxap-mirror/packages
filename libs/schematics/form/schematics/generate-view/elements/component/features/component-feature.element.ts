import { ParsedElement } from '@rxap/xml-parser';
import {
  Rule,
  noop
} from '@angular-devkit/schematics';
import { ToValueContext } from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { ElementDef } from '@rxap/xml-parser/decorators';
import { ComponentElement } from '../component.element';

@ElementDef('component-feature')
export class ComponentFeatureElement implements ParsedElement<Rule> {

  __parent!: ComponentElement;

  handleComponent({
                    project,
                    sourceFile,
                    options
                  }: ToValueContext & { sourceFile: SourceFile }): void {
  }

  handleComponentModule({
                          project,
                          sourceFile,
                          options
                        }: ToValueContext & { sourceFile: SourceFile }): void {
  }

  toValue({ project, options }: ToValueContext): Rule {
    return noop();
  }

}
