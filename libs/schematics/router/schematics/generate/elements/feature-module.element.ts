import {
  ElementDef,
  ElementTextContent,
  ElementRequired,
  ElementAttribute
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  Rule,
  chain,
  externalSchematic
} from '@angular-devkit/schematics';
import { RoutingSchema } from '../schema';
import { ToValueContext } from '@rxap/schematics-ts-morph';
import {
  SourceFile,
  VariableDeclarationKind,
  Writers
} from 'ts-morph';
import { join } from 'path';
import { HandelTemplate } from './utils';
import { strings } from '@angular-devkit/core';
import { getWorkspace } from '@schematics/angular/utility/workspace';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementDef('feature-module')
export class FeatureModuleElement implements ParsedElement<Rule> {

  @ElementTextContent()
  @ElementRequired()
  public name!: string;

  @ElementAttribute()
  public generate: boolean = true;

  public buildLoadChildrenFunction({ options }: { options: RoutingSchema }): string {
    return `() => import('@${options.prefix!}/feature/${dasherize(this.name)}').then(m => m.Feature${classify(this.name)}Module)`;
  }

  public toValue({ project, options }: ToValueContext<RoutingSchema> & { sourceFile: SourceFile }): Rule {
    return chain([
      this.coerceFeatureProject({ options, project })
    ]);
  }

  private coerceFeatureProject({ options, project }: ToValueContext<RoutingSchema>): Rule {
    return async host => {

      const workspace = await getWorkspace(host);

      const rules: Rule[] = [];

      const projectName           = `feature-${dasherize(this.name)}`;
      const basePath              = join('libs', 'feature', dasherize(this.name), 'src', 'lib');
      const featureModuleFilePath = join(basePath, `feature-${dasherize(this.name)}.module.ts`);

      if (!workspace.projects.has(projectName)) {
        rules.push(() => console.log(`Execute external feature-module schematic for '${this.name}'`));
        rules.push(externalSchematic(
          '@rxap/schematics',
          'feature-module',
          { name: this.name }
        ));
        rules.push(tree => {

          const sourceFile = project.createSourceFile(featureModuleFilePath);

          sourceFile.addVariableStatement({
            isExported:      true,
            declarations:    [
              {
                name:        `${classify(projectName)}Routes`,
                type:        'Routes',
                initializer: '[]'
              }
            ],
            declarationKind: VariableDeclarationKind.Const
          });

          sourceFile.addClass({
            isExported: true,
            name:       classify(projectName) + 'Module',
            decorators: [
              {
                name:      'NgModule',
                arguments: [
                  Writers.object({
                    imports: `[ RouterModule.forChild(${classify(projectName)}Routes) ]`
                  })
                ]
              }
            ]
          });

          sourceFile.addImportDeclarations([
            {
              namedImports:    [ 'Routes', 'RouterModule' ],
              moduleSpecifier: '@angular/router'
            },
            {
              namedImports:    [ 'NgModule' ],
              moduleSpecifier: '@angular/core'
            }
          ]);

          tree.overwrite(featureModuleFilePath, sourceFile.getFullText());

        });
      } else {
        console.log(`The feature module '${this.name}' is already created.`);
      }

      if (this.generate) {
        if (options.feature === undefined || options.feature === this.name) {
          rules.push(() => console.log(`Execute schematic routing for '${this.name}'`));
          rules.push(HandelTemplate({
            ...options,
            path:             basePath,
            project:          projectName,
            routingModule:    featureModuleFilePath,
            template:         `templates/features/${dasherize(this.name)}/${dasherize(this.name)}.xml`,
            templateBasePath: `features/${dasherize(this.name)}`,
            organizeImports:  false,
            fixImports:       false,
            format:           false,
            overwrite:        options.overwrite
          }));
        }
      }

      return chain(rules);

    };
  }

}
