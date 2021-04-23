import {
  ElementExtends,
  ElementDef,
  ElementChildren
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import {
  ToValueContext,
  AddNgModuleImport
} from '@rxap/schematics-ts-morph';
import { SourceFile } from 'ts-morph';
import { Required } from '@rxap/utilities';
import { ArrayFeatureElement } from './array-feature.element';
import { NodeFactory } from '@rxap/schematics-html';

// TODO : remove duplication

export enum PermissionElementType {
  Attribute,
  Wrapper
}

export class PermissionElement implements ParsedElement {

  public permissionIdentifierSuffix: string;

  public __tag?: string;

  public type?: PermissionElementType;

  @Required
  public directiveName!: string;

  constructor() {
    this.permissionIdentifierSuffix = this.__tag ?? '';
  }

  public toValue(): any {}

  public getPermissionIdentifier(basePermissionIdentifier: string): string {
    return [ basePermissionIdentifier, this.permissionIdentifierSuffix ].filter(Boolean).join('.');
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, 'HasPermissionModule', '@mfd/shared/authorization/has-permission.module');
  }

}

@ElementDef('enable')
@ElementExtends(PermissionElement)
export class EnablePermissionElement extends PermissionElement {

  public directiveName = 'rxapHasEnablePermission';

  public type = PermissionElementType.Attribute;

}

@ElementDef('write')
@ElementExtends(PermissionElement)
export class WritePermissionElement extends PermissionElement {

  public directiveName = 'rxapHasWritePermission';

  public type = PermissionElementType.Attribute;

}

@ElementDef('show')
@ElementExtends(PermissionElement)
export class ShowPermissionElement extends PermissionElement {

  public directiveName = 'rxapIfHasPermission';

  public type = PermissionElementType.Wrapper;

}

@ElementDef('permissions')
@ElementExtends(ArrayFeatureElement)
export class PermissionsElement extends ArrayFeatureElement {

  @ElementChildren(PermissionElement)
  public permissions: PermissionElement[] = [];

  public hasPermission(tag: string): boolean {
    return !!this.permissions.find(permission => permission.__tag === tag);
  }

  public getPermission<T extends PermissionElement>(tag: string): T {
    const permissionElement = this.permissions?.find(permission => permission.__tag === tag);
    if (!permissionElement) {
      throw new Error(`Could not find permission '${tag}' for the control '${this.__parent.controlPath}'!`);
    }
    return permissionElement as any;
  }

  public getAttributes(basePermissionIdentifier: string): string[] {
    const attributes: string[] = [];
    for (const permission of this.permissions) {
      if (permission.type === PermissionElementType.Attribute) {
        attributes.push(`${permission.directiveName}="${permission.getPermissionIdentifier(basePermissionIdentifier)}"`);
      }
    }
    return attributes;
  }

  public wrapNode(node: string, basePermissionIdentifier: string): string {
    for (const permission of this.permissions) {
      if (permission.type === PermissionElementType.Wrapper) {
        node = NodeFactory(
          'ng-container',
          `*${permission.directiveName}="'${permission.getPermissionIdentifier(basePermissionIdentifier)}'"`
        )(node);
      }
    }
    return node;
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    this.permissions.forEach(permission => permission.handleComponentModule({ project, sourceFile, options }));
  }

}
