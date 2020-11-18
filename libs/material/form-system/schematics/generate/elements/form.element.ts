import { GroupElement } from './group.element';
import {
  ElementDef,
  ElementExtends,
  ElementChildren
} from '@rxap/xml-parser/decorators';
import { NodeElement } from './node.element';
import {
  NodeFactory,
  ToValueContext,
  AddDir,
  ApplyTsMorphProject,
  AutoImport,
  AddNgModuleImport,
  AddComponentProvider
} from '@rxap-schematics/utilities';
import { SourceFile } from 'ts-morph';
import {
  chain,
  Rule,
  externalSchematic
} from '@angular-devkit/schematics';
import { join } from 'path';
import { strings } from '@angular-devkit/core';
import { GenerateSchema } from '../schema';
import { FormFeatureElement } from './features/form-feature.element';

const { dasherize, classify, camelize, capitalize } = strings;

@ElementExtends(NodeElement)
@ElementDef('definition')
export class FormElement extends GroupElement {

  @ElementChildren(FormFeatureElement, { group: 'features' })
  public features?: FormFeatureElement[];

  public template(): string {
    return NodeFactory('form', 'rxapForm')(
      [
        ...this.nodes,
        ...(this.features ?? [])
      ]);
  }

  public get controlPath(): string {
    return this.name;
  }

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponent({ project, sourceFile, options }));
    this.features?.forEach(feature => feature.handleComponent({ project, sourceFile, options }));
    AddComponentProvider(
      sourceFile,
      'FormProviders',
      [
        {
          namedImports:    [ 'FormProviders' ],
          moduleSpecifier: './form.providers'
        }
      ]
    );
    AddComponentProvider(
      sourceFile,
      'FormComponentProviders',
      [
        {
          namedImports:    [ 'FormComponentProviders' ],
          moduleSpecifier: './form.providers'
        }
      ]
    );
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    this.nodes.forEach(node => node.handleComponentModule({ project, sourceFile, options }));
    this.features?.forEach(feature => feature.handleComponentModule({ project, sourceFile, options }));
    AddNgModuleImport(sourceFile, 'RxapFormsModule', '@rxap/forms');
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    const componentFile             = dasherize(options.name!) + '-form.component.ts';
    const componentModuleFile       = dasherize(options.name!) + '-form.component.module.ts';
    const componentTemplateFilePath = join(options.path!, dasherize(options.name!) + '-form.component.html');
    return chain([
      externalSchematic(
        '@rxap/forms',
        'generate',
        {
          project:  options.project,
          name:     options.name,
          template: join('forms', dasherize(this.name) + '.xml'),
          path:     options.path!.replace(/^\//, ''),
          flat:     true
        }
      ),
      tree => tree.overwrite(componentTemplateFilePath, this.template()),
      tree => AddDir(tree.getDir(options.path!), project, undefined, pathFragment => !!pathFragment.match(/\.ts$/)),
      chain(this.nodes.map(node => node.toValue({ project, options }))),
      chain(this.features?.map(feature => feature.toValue({ project, options })) ?? []),
      () => this.handleComponent({ project, options, sourceFile: project.getSourceFileOrThrow(componentFile) }),
      () => this.handleComponentModule({ project, options, sourceFile: project.getSourceFileOrThrow(componentModuleFile) }),
      ApplyTsMorphProject(project, options.path),
      AutoImport(join(options.path!, '..'), options.path!)
    ]);
  }

}
