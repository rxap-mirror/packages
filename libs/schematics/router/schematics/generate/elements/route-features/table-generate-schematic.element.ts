import {
  ElementExtends,
  ElementDef,
  ElementChildTextContent
} from '@rxap/xml-parser/decorators';
import { RouteFeatureElement } from './route-feature.element';
import { join } from 'path';
import { ElementFactory } from '@rxap/xml-parser';
import { ComponentElement } from '../component.element';
import { ModuleElement } from '../module.element';
import { RoutingSchema } from '../../schema';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { RouteElement } from '../route.element';
import { strings } from '@angular-devkit/core';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(RouteFeatureElement)
@ElementDef('table')
export class TableGenerateSchematicElement extends RouteFeatureElement {

  public __parent!: RouteElement;

  @ElementChildTextContent()
  public template!: string;

  @ElementChildTextContent()
  public name?: string;

  public postParse() {
    if (!this.template && this.name) {
      this.template = join('views', 'tables', dasherize(this.name) + '.xml');
    }
  }

  public postValidate() {
    if (!this.__parent.component && this.name) {
      this.__parent.component = ElementFactory(ComponentElement, {
        name: classify(this.name) + 'TableComponent',
        from: './' + join(dasherize(this.name) + '-table', dasherize(this.name) + '-table.component')
      });
      this.__parent.module    = ElementFactory(ModuleElement, {
        name: classify(this.name) + 'TableComponentModule',
        from: './' + join(dasherize(this.name) + '-table', dasherize(this.name) + '-table.component.module')
      });
    }
  }

  public validate(): boolean {
    return !!this.template;
  }

  public toValue({ options }: { options: RoutingSchema }): Rule {
    return chain([
      () => console.log(`Execute table generator schematic for '${this.template}'`),
      externalSchematic(
        '@rxap/material-table-system',
        'generate',
        {
          project:         options.project,
          template:        this.template,
          name:            this.name,
          organizeImports: false,
          fixImports:      false,
          format:          false,
          overwrite:       options.overwrite,
          openApiModule:   options.openApiModule
        }
      )
    ]);
  }

}
