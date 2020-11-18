import {
  DisplayColumn,
  FeatureElement
} from './feature.element';
import {
  ElementAttribute,
  ElementChild,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import {
  Scope,
  SourceFile
} from 'ts-morph';
import { ParsedElement } from '@rxap/xml-parser';
import { TableElement } from '../table.element';
import { strings } from '@angular-devkit/core';
import {
  ToValueContext,
  AddNgModuleImport,
  MethodElement,
  HandleComponent,
  AddComponentProvider
} from '@rxap-schematics/utilities';

const { dasherize, classify, camelize } = strings;

@ElementDef('child')
export class ChildElement implements ParsedElement, HandleComponent {

  public __parent!: TreeTableElement;

  @ElementChild(MethodElement)
  @ElementRequired()
  public method!: MethodElement;

  @ElementAttribute()
  public proxy?: boolean;

  public get proxyMethodFilePath(): string {
    return `tree-table-children-proxy.method`;
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.proxy) {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD',
          useClass: 'TreeTableChildrenProxyMethod'
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD' ]
          },
          {
            moduleSpecifier: `./${this.proxyMethodFilePath}`,
            namedImports:    [ 'TreeTableChildrenProxyMethod' ]
          }
        ]
      );
    } else {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD',
          useClass: this.method.toValue({ sourceFile, project, options })
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_CHILDREN_REMOTE_METHOD' ]
          }
        ]
      );
    }
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {
    if (this.proxy) {
      if (!project.getSourceFile(this.proxyMethodFilePath + '.ts')) {
        // TODO : replace with generalized proxy method creation from @rxap/remote-method
        const proxyMethodSourceFile = project.createSourceFile(this.proxyMethodFilePath + '.ts');
        const methodName            = this.method.toValue({ sourceFile: proxyMethodSourceFile, project, options });
        proxyMethodSourceFile.addClass({
          name:       'TreeTableChildrenProxyMethod',
          extends:    'ProxyRemoteMethod',
          isExported: true,
          decorators: [
            {
              name:      'Injectable',
              arguments: []
            },
            {
              name:      'RxapRemoteMethod',
              arguments: [ writer => writer.quote(`${dasherize(this.__parent.__parent.id)}-tree-table-children-proxy`) ]
            }
          ],
          ctors:      [
            {
              parameters: [
                {
                  name:       'method',
                  type:       methodName,
                  decorators: [
                    {
                      name:      'Inject',
                      arguments: [ methodName ]
                    }
                  ]
                }
              ],
              statements: [ 'super(method);' ]
            }
          ],
          methods:    [
            {
              name:       'transformParameters',
              isAsync:    true,
              statements: [ 'return node;' ],
              scope:      Scope.Public,
              parameters: [
                {
                  name: 'node',
                  type: 'Node<any>'
                }
              ]
            }
          ]
        });
        proxyMethodSourceFile.addImportDeclarations([
          {
            namedImports:    [ 'Node' ],
            moduleSpecifier: '@rxap/utilities'
          },
          {
            namedImports:    [ 'Injectable', 'Inject' ],
            moduleSpecifier: '@angular/core'
          },
          {
            namedImports:    [ 'ProxyRemoteMethod', 'RxapRemoteMethod' ],
            moduleSpecifier: '@rxap/remote-method'
          }
        ]);
      }
    }
  }

}

@ElementDef('root')
export class RootElement implements ParsedElement, HandleComponent {

  public __parent!: TreeTableElement;

  @ElementChild(MethodElement)
  @ElementRequired()
  public method!: MethodElement;

  @ElementAttribute()
  public proxy?: boolean;

  public get proxyMethodFilePath(): string {
    return `tree-table-root-proxy.method`;
  }

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    if (this.proxy) {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD',
          useClass: 'TreeTableRootProxyMethod'
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD' ]
          },
          {
            moduleSpecifier: `./${this.proxyMethodFilePath}`,
            namedImports:    [ 'TreeTableRootProxyMethod' ]
          }
        ]
      );
    } else {
      AddComponentProvider(
        sourceFile,
        {
          provide:  'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD',
          useClass: this.method.toValue({ sourceFile, project, options })
        },
        [
          {
            // TODO : mv RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD to rxap
            moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source',
            namedImports:    [ 'RXAP_TREE_TABLE_DATA_SOURCE_ROOT_REMOTE_METHOD' ]
          }
        ]
      );
    }
  }

  public toValue({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }): any {
    if (this.proxy) {
      if (!project.getSourceFile(this.proxyMethodFilePath + '.ts')) {
        // TODO : replace with generalized proxy method creation from @rxap/remote-method
        const proxyMethodSourceFile = project.createSourceFile(this.proxyMethodFilePath + '.ts');
        const methodName            = this.method.toValue({ sourceFile: proxyMethodSourceFile, project, options });
        proxyMethodSourceFile.addClass({
          name:       'TreeTableRootProxyMethod',
          extends:    'ProxyRemoteMethod',
          isExported: true,
          decorators: [
            {
              name:      'Injectable',
              arguments: []
            },
            {
              name:      'RxapRemoteMethod',
              arguments: [ writer => writer.quote(`${dasherize(this.__parent.__parent.id)}-tree-table-root-proxy`) ]
            }
          ],
          ctors:      [
            {
              parameters: [
                {
                  name:       'method',
                  type:       methodName,
                  decorators: [
                    {
                      name:      'Inject',
                      arguments: [ methodName ]
                    }
                  ]
                }
              ],
              statements: [ 'super(method);' ]
            }
          ],
          methods:    [
            {
              name:       'transformParameters',
              isAsync:    true,
              statements: [ 'return node;' ],
              scope:      Scope.Public,
              parameters: [
                {
                  name: 'node',
                  type: 'Node<any>'
                }
              ]
            }
          ]
        });
        proxyMethodSourceFile.addImportDeclarations([
          {
            namedImports:    [ 'Node' ],
            moduleSpecifier: '@rxap/utilities'
          },
          {
            namedImports:    [ 'Injectable', 'Inject' ],
            moduleSpecifier: '@angular/core'
          },
          {
            namedImports:    [ 'ProxyRemoteMethod', 'RxapRemoteMethod' ],
            moduleSpecifier: '@rxap/remote-method'
          }
        ]);
      }
    }
  }

}

@ElementExtends(FeatureElement)
@ElementDef('tree-table')
export class TreeTableElement extends FeatureElement {

  public __parent!: TableElement;

  @ElementChild(ChildElement)
  @ElementRequired()
  public child!: ChildElement;

  @ElementChild(RootElement)
  @ElementRequired()
  public root!: RootElement;

  public handleComponent({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ sourceFile, project, options });
    this.child.handleComponent({ sourceFile, project, options });
    this.root.handleComponent({ sourceFile, project, options });
    AddComponentProvider(
      sourceFile,
      {
        provide:  'TABLE_DATA_SOURCE',
        useClass: 'TreeTableDataSource'
      },
      [
        {
          namedImports:    [ 'TreeTableDataSource' ],
          // TODO : mv TreeTableDataSource to rxap
          moduleSpecifier: '@mfd/shared/data-sources/tree-table.data-source'
        },
        {
          namedImports:    [ 'TABLE_DATA_SOURCE' ],
          // TODO : mv TABLE_DATA_SOURCE to rxap
          moduleSpecifier: '@mfd/shared/table-data-source.directive'
        }
      ]
    );
  }

  public handleComponentModule({ sourceFile, project, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'TreeControlCellComponentModule', '@mfd/shared/tree-control-cell/tree-control-cell.component.module');
    this.child.toValue({ sourceFile, project, options });
    this.root.toValue({ sourceFile, project, options });
  }

  public displayColumn(): DisplayColumn | null {
    return {
      name:   'tree',
      hidden: true
    };
  }

  public columnTemplate(): string {
    return `
    <ng-container matColumnDef="tree" sticky>
      <th *matHeaderCellDef mat-header-cell></th>
      <td *matCellDef="let element" [rxap-tree-control-cell]="element" mat-cell></td>
    </ng-container>
    `;
  }

  public columnTemplateFilter(): string {
    return FeatureElement.ColumnNoFilter('tree', true);
  }

}
