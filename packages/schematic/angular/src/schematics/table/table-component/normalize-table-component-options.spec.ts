import {
  BackendTypes,
  FormControlKinds,
  HeaderButtonKind,
  TableActionKind,
  TableColumnKind,
  TableModifiers,
} from '@rxap/schematic-angular';
import { NormalizeTableComponentOptions } from './normalize-table-component-options';
import { TableComponentOptions } from './schema';

describe('NormalizeTableComponentOptions', () => {
  it('should normalize minimal table component options', () => {
    const options: TableComponentOptions = {
      name: 'test-table',
      project: 'ui-lib',
      columnList: [],
      actionList: [],
      filterList: [],
      propertyList: [],
    };

    expect(NormalizeTableComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize complex table component options', () => {
    const options: TableComponentOptions = {
      name: 'test-table',
      project: 'ui-lib',
      columnList: [
        {
          name: 'name',
          kind: TableColumnKind.DEFAULT,
        },
        {
          name: 'created',
          kind: TableColumnKind.DATE,
        },
      ],
      actionList: [],
      filterList: [],
      propertyList: [],
      backend: {
        kind: BackendTypes.NESTJS,
        project: 'api',
        module: 'api-module',
      },
      sortable: true,
      selectColumn: true,
      modifiers: [ TableModifiers.WITHOUT_TITLE ],
    };

    expect(NormalizeTableComponentOptions(options)).toMatchSnapshot();
  });

  it('should normalize real table component options', () => {

    const input: TableComponentOptions = {
      'overwrite': false,
      'replace': false,
      'project': 'ui-admin',
      'name': 'workspace-member',
      'backend': {
        'kind': BackendTypes.NESTJS,
        'project': 'api-feature-admin',
        'module': 'workspace-member',
      },
      'columnList': [
        {
          'name': 'email',
          'title': 'Email',
        }, {
          'name': 'displayName',
          'title': 'Name',
        }, {
          'name': 'role',
          'title': 'Role',
          'kind': TableColumnKind.OPTIONS,
          'optionList': [
            {
              'value': 'admin',
              'display': 'Admin',
            }, {
              'value': 'reviewer',
              'display': 'Reviewer',
            }, {
              'value': 'editor',
              'display': 'Editor',
            },
          ],
        },
      ],
      'actionList': [
        {
          'type': 'edit',
          'kind': TableActionKind.FORM,
          'icon': 'edit',
          'tooltip': 'Change Role',
          'form': {
            'controlList': [
              {
                'name': 'role',
                'label': 'Role',
                'kind': FormControlKinds.SELECT,
                'isRequired': true,
                'optionList': [
                  {
                    'value': 'admin',
                    'display': 'Admin',
                  }, {
                    'value': 'reviewer',
                    'display': 'Reviewer',
                  }, {
                    'value': 'editor',
                    'display': 'Editor',
                  },
                ],
              },
            ],
          },
        }, {
          'type': 'delete',
          'icon': 'person_remove',
          'confirm': true,
          'refresh': true,
          'tooltip': 'Remove from Workspace',
        },
      ],
      'headerButton': {
        'kind': HeaderButtonKind.FORM,
        'icon': 'person_add',
        'label': 'Add Member',
        'form': {
          'controlList': [
            {
              'name': 'userId',
              'label': 'User',
              'kind': FormControlKinds.TABLE_SELECT,
              'isRequired': true,
              'columnList': [
                {
                  'name': 'email',
                  'title': 'Email',
                }, {
                  'name': 'displayName',
                  'title': 'Name',
                },
              ],
              'toValue': { 'property': { name: 'id' } },
              'toDisplay': { 'property': { name: 'displayName' } },
            }, {
              'name': 'role',
              'label': 'Role',
              'kind': FormControlKinds.SELECT,
              'isRequired': true,
              'optionList': [
                {
                  'value': 'admin',
                  'display': 'Admin',
                }, {
                  'value': 'reviewer',
                  'display': 'Reviewer',
                }, {
                  'value': 'editor',
                  'display': 'Editor',
                },
              ],
            },
          ],
        },
      },
      'directory': 'app',
      filterList: [],
      propertyList: [],
    };

    const options = NormalizeTableComponentOptions(input);

    expect(options).toEqual({
      "actionList": [
        {
          "checkFunction": null,
          "color": null,
          "confirm": false,
          "cssClass": null,
          "customComponent": false,
          "errorMessage": null,
          "form": {
            "controlList": [
              {
                "backend": {
                  "kind": "nestjs",
                  "module": "workspace-member",
                  "prefix": null,
                  "project": "api-feature-admin",
                  "serverId": null
                },
                "dataSource": null,
                "formField": {
                  "cssClass": null,
                  "directiveList": [],
                  "hasClearButton": true,
                  "label": "Role",
                  "prefixButton": null,
                  "suffixButton": {
                    "directiveList": [
                      {
                        "defaultImport": null,
                        "isTypeOnly": false,
                        "moduleSpecifier": "@rxap/material-form-system",
                        "name": "rxapInputClearButton",
                        "namedImport": "InputClearButtonDirective",
                        "namespaceImport": null
                      }
                    ],
                    "icon": "clear",
                    "importList": [
                      {
                        "defaultImport": null,
                        "isTypeOnly": false,
                        "moduleSpecifier": "@angular/material/icon",
                        "name": "MatIconModule",
                        "namedImport": null,
                        "namespaceImport": null
                      },
                      {
                        "defaultImport": null,
                        "isTypeOnly": false,
                        "moduleSpecifier": "@angular/material/button",
                        "name": "MatButtonModule",
                        "namedImport": null,
                        "namespaceImport": null
                      }
                    ],
                    "svgIcon": null
                  }
                },
                "handlebars": expect.any(Function),
                "importList": [
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@angular/material/select",
                    "name": "MatSelectModule",
                    "namedImport": null,
                    "namespaceImport": null
                  },
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@rxap/form-system",
                    "name": "InputSelectOptionsDirective",
                    "namedImport": null,
                    "namespaceImport": null
                  },
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@angular/material/icon",
                    "name": "MatIconModule",
                    "namedImport": null,
                    "namespaceImport": null
                  },
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@angular/material/button",
                    "name": "MatButtonModule",
                    "namedImport": null,
                    "namespaceImport": null
                  },
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@rxap/material-form-system",
                    "name": "rxapInputClearButton",
                    "namedImport": "InputClearButtonDirective",
                    "namespaceImport": null
                  },
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@rxap/material-form-system",
                    "name": "RequiredDirective",
                    "namedImport": null,
                    "namespaceImport": null
                  },
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@angular/forms",
                    "name": "ReactiveFormsModule",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                ],
                "isArray": false,
                "isDisabled": false,
                "isOptional": false,
                "isReadonly": false,
                "isRequired": true,
                "kind": "select",
                "label": "Role",
                "memberList": [],
                "multiple": false,
                "name": "role",
                "optionList": [
                  {
                    "display": "Admin",
                    "value": "admin"
                  },
                  {
                    "display": "Reviewer",
                    "value": "reviewer"
                  },
                  {
                    "display": "Editor",
                    "value": "editor"
                  }
                ],
                "role": "control",
                "source": null,
                "state": null,
                "template": "select-form-control.hbs",
                "type": {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": null,
                  "name": "unknown",
                  "namedImport": null,
                  "namespaceImport": null
                },
                "upstream": null,
                "validatorList": []
              }
            ],
            "identifier": null,
            "matFormFieldDefaultOptions": null,
            "role": null,
            "window": false
          },
          "formComponent": "edit-form",
          "formInitial": false,
          "icon": "edit",
          "inHeader": false,
          "kind": "form",
          "loadFrom": null,
          "permission": null,
          "priority": 0,
          "refresh": false,
          "successMessage": null,
          "svgIcon": null,
          "tooltip": "Change Role",
          "type": "edit"
        },
        {
          "checkFunction": null,
          "color": null,
          "confirm": true,
          "cssClass": null,
          "errorMessage": null,
          "icon": "person_remove",
          "inHeader": false,
          "kind": "default",
          "permission": null,
          "priority": 0,
          "refresh": true,
          "successMessage": null,
          "svgIcon": null,
          "tooltip": "Remove from Workspace",
          "type": "delete"
        }
      ],
      "backend": {
        "kind": "nestjs",
        "module": "workspace-member",
        "prefix": null,
        "project": "api-feature-admin",
        "serverId": null
      },
      "columnList": [
        {
          "active": false,
          "cssClass": null,
          "filterControl": null,
          "filterCssClass": null,
          "filterName": "filter_email",
          "handlebars": expect.any(Function),
          "hasFilter": false,
          "headerCssClass": null,
          "hidden": false,
          "importList": [],
          "inactive": false,
          "isArray": false,
          "isOptional": false,
          "kind": "default",
          "memberList": [],
          "modifiers": [],
          "name": "email",
          "nowrap": false,
          "pipeList": [],
          "propertyPath": "email",
          "show": false,
          "sortable": false,
          "source": null,
          "sticky": null,
          "stickyEnd": false,
          "stickyStart": false,
          "synthetic": false,
          "template": "default-table-column.hbs",
          "title": "Email",
          "type": {
            "defaultImport": null,
            "isTypeOnly": false,
            "moduleSpecifier": null,
            "name": "unknown",
            "namedImport": null,
            "namespaceImport": null
          },
          "withoutTitle": false
        },
        {
          "active": false,
          "cssClass": null,
          "filterControl": null,
          "filterCssClass": null,
          "filterName": "filter_displayName",
          "handlebars": expect.any(Function),
          "hasFilter": false,
          "headerCssClass": null,
          "hidden": false,
          "importList": [],
          "inactive": false,
          "isArray": false,
          "isOptional": false,
          "kind": "default",
          "memberList": [],
          "modifiers": [],
          "name": "displayName",
          "nowrap": false,
          "pipeList": [],
          "propertyPath": "displayName",
          "show": false,
          "sortable": false,
          "source": null,
          "sticky": null,
          "stickyEnd": false,
          "stickyStart": false,
          "synthetic": false,
          "template": "default-table-column.hbs",
          "title": "Name",
          "type": {
            "defaultImport": null,
            "isTypeOnly": false,
            "moduleSpecifier": null,
            "name": "string",
            "namedImport": null,
            "namespaceImport": null
          },
          "withoutTitle": false
        },
        {
          "active": false,
          "cssClass": null,
          "filterControl": null,
          "filterCssClass": null,
          "filterName": "filter_role",
          "handlebars": expect.any(Function),
          "hasFilter": false,
          "headerCssClass": null,
          "hidden": false,
          "importList": [
            {
              "defaultImport": null,
              "isTypeOnly": false,
              "moduleSpecifier": "@rxap/material-table-system",
              "name": "OptionsCellComponent",
              "namedImport": null,
              "namespaceImport": null
            },
            {
              "defaultImport": null,
              "isTypeOnly": false,
              "moduleSpecifier": "@angular/material/core",
              "name": "MatOptionModule",
              "namedImport": null,
              "namespaceImport": null
            }
          ],
          "inactive": false,
          "isArray": false,
          "isOptional": false,
          "kind": "options",
          "memberList": [],
          "modifiers": [],
          "name": "role",
          "nowrap": false,
          "optionList": [
            {
              "display": "Admin",
              "value": "admin"
            },
            {
              "display": "Reviewer",
              "value": "reviewer"
            },
            {
              "display": "Editor",
              "value": "editor"
            }
          ],
          "pipeList": [],
          "propertyPath": "role",
          "show": false,
          "sortable": false,
          "source": null,
          "sticky": null,
          "stickyEnd": false,
          "stickyStart": false,
          "synthetic": false,
          "template": "options-table-column.hbs",
          "title": "Role",
          "type": {
            "defaultImport": null,
            "isTypeOnly": false,
            "moduleSpecifier": null,
            "name": "unknown",
            "namedImport": null,
            "namespaceImport": null
          },
          "withoutTitle": false
        }
      ],
      "componentName": "workspace-member-table",
      "context": null,
      "controllerName": "workspace-member-table",
      "cssClass": null,
      "directory": "app/workspace-member-table",
      "feature": null,
      "filterList": [],
      "hasPaginator": true,
      "headerButton": {
        "confirm": false,
        "errorMessage": null,
        "form": {
          "controlList": [
            {
              "backend": {
                "kind": "nestjs",
                "module": "workspace-member",
                "prefix": null,
                "project": "api-feature-admin",
                "serverId": null
              },
              "columnList": [
                {
                  "hasFilter": false,
                  "isArray": false,
                  "isOptional": false,
                  "kind": "default",
                  "memberList": [],
                  "name": "email",
                  "propertyPath": "email",
                  "source": null,
                  "title": "Email",
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "unknown",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                },
                {
                  "hasFilter": false,
                  "isArray": false,
                  "isOptional": false,
                  "kind": "default",
                  "memberList": [],
                  "name": "displayName",
                  "propertyPath": "displayName",
                  "source": null,
                  "title": "Name",
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "string",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                }
              ],
              "dataSource": null,
              "formField": {
                "cssClass": null,
                "directiveList": [
                  {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": "@rxap/ngx-material-table-select",
                    "name": "rxapTableSelectControl",
                    "namedImport": "TableSelectControlModule",
                    "namespaceImport": null
                  }
                ],
                "hasClearButton": true,
                "label": "User",
                "prefixButton": null,
                "suffixButton": {
                  "directiveList": [
                    {
                      "defaultImport": null,
                      "isTypeOnly": false,
                      "moduleSpecifier": "@rxap/material-form-system",
                      "name": "rxapInputClearButton",
                      "namedImport": "InputClearButtonDirective",
                      "namespaceImport": null
                    }
                  ],
                  "icon": "clear",
                  "importList": [
                    {
                      "defaultImport": null,
                      "isTypeOnly": false,
                      "moduleSpecifier": "@angular/material/icon",
                      "name": "MatIconModule",
                      "namedImport": null,
                      "namespaceImport": null
                    },
                    {
                      "defaultImport": null,
                      "isTypeOnly": false,
                      "moduleSpecifier": "@angular/material/button",
                      "name": "MatButtonModule",
                      "namedImport": null,
                      "namespaceImport": null
                    }
                  ],
                  "svgIcon": null
                }
              },
              "handlebars": expect.any(Function),
              "identifier": {
                "property": {
                  "isArray": false,
                  "isOptional": false,
                  "memberList": [],
                  "name": "id",
                  "source": null,
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "unknown",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                },
                "source": null
              },
              "importList": [
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@rxap/ngx-material-table-select",
                  "name": "TableSelectControlModule",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@angular/material/icon",
                  "name": "MatIconModule",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@angular/material/button",
                  "name": "MatButtonModule",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@rxap/material-form-system",
                  "name": "rxapInputClearButton",
                  "namedImport": "InputClearButtonDirective",
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@rxap/material-form-system",
                  "name": "RequiredDirective",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@angular/forms",
                  "name": "ReactiveFormsModule",
                  "namedImport": null,
                  "namespaceImport": null
                }
              ],
              "isArray": false,
              "isDisabled": false,
              "isOptional": false,
              "isReadonly": false,
              "isRequired": true,
              "kind": FormControlKinds.TABLE_SELECT,
              "label": "User",
              "memberList": [],
              "name": "userId",
              "options": null,
              "propertyList": [
                {
                  "isArray": false,
                  "isOptional": false,
                  "memberList": [],
                  "name": "displayName",
                  "source": null,
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "string",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                },
                {
                  "isArray": false,
                  "isOptional": false,
                  "memberList": [],
                  "name": "id",
                  "source": null,
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "unknown",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                },
                {
                  "hasFilter": false,
                  "isArray": false,
                  "isOptional": false,
                  "kind": "default",
                  "memberList": [],
                  "name": "email",
                  "propertyPath": "email",
                  "source": null,
                  "title": "Email",
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "unknown",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                }
              ],
              "resolver": null,
              "role": "control",
              "source": null,
              "state": null,
              "template": "table-select-form-control.hbs",
              "title": null,
              "toDisplay": {
                "property": {
                  "isArray": false,
                  "isOptional": false,
                  "memberList": [],
                  "name": "displayName",
                  "source": null,
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "string",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                }
              },
              "toValue": {
                "property": {
                  "isArray": false,
                  "isOptional": false,
                  "memberList": [],
                  "name": "id",
                  "source": null,
                  "type": {
                    "defaultImport": null,
                    "isTypeOnly": false,
                    "moduleSpecifier": null,
                    "name": "unknown",
                    "namedImport": null,
                    "namespaceImport": null
                  }
                }
              },
              "type": {
                "defaultImport": null,
                "isTypeOnly": false,
                "moduleSpecifier": null,
                "name": "unknown",
                "namedImport": null,
                "namespaceImport": null
              },
              "upstream": null,
              "validatorList": []
            },
            {
              "backend": {
                "kind": "nestjs",
                "module": "workspace-member",
                "prefix": null,
                "project": "api-feature-admin",
                "serverId": null
              },
              "dataSource": null,
              "formField": {
                "cssClass": null,
                "directiveList": [],
                "hasClearButton": true,
                "label": "Role",
                "prefixButton": null,
                "suffixButton": {
                  "directiveList": [
                    {
                      "defaultImport": null,
                      "isTypeOnly": false,
                      "moduleSpecifier": "@rxap/material-form-system",
                      "name": "rxapInputClearButton",
                      "namedImport": "InputClearButtonDirective",
                      "namespaceImport": null
                    }
                  ],
                  "icon": "clear",
                  "importList": [
                    {
                      "defaultImport": null,
                      "isTypeOnly": false,
                      "moduleSpecifier": "@angular/material/icon",
                      "name": "MatIconModule",
                      "namedImport": null,
                      "namespaceImport": null
                    },
                    {
                      "defaultImport": null,
                      "isTypeOnly": false,
                      "moduleSpecifier": "@angular/material/button",
                      "name": "MatButtonModule",
                      "namedImport": null,
                      "namespaceImport": null
                    }
                  ],
                  "svgIcon": null
                }
              },
              "handlebars": expect.any(Function),
              "importList": [
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@angular/material/select",
                  "name": "MatSelectModule",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@rxap/form-system",
                  "name": "InputSelectOptionsDirective",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@angular/material/icon",
                  "name": "MatIconModule",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@angular/material/button",
                  "name": "MatButtonModule",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@rxap/material-form-system",
                  "name": "rxapInputClearButton",
                  "namedImport": "InputClearButtonDirective",
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@rxap/material-form-system",
                  "name": "RequiredDirective",
                  "namedImport": null,
                  "namespaceImport": null
                },
                {
                  "defaultImport": null,
                  "isTypeOnly": false,
                  "moduleSpecifier": "@angular/forms",
                  "name": "ReactiveFormsModule",
                  "namedImport": null,
                  "namespaceImport": null
                }
              ],
              "isArray": false,
              "isDisabled": false,
              "isOptional": false,
              "isReadonly": false,
              "isRequired": true,
              "kind": "select",
              "label": "Role",
              "memberList": [],
              "multiple": false,
              "name": "role",
              "optionList": [
                {
                  "display": "Admin",
                  "value": "admin"
                },
                {
                  "display": "Reviewer",
                  "value": "reviewer"
                },
                {
                  "display": "Editor",
                  "value": "editor"
                }
              ],
              "role": "control",
              "source": null,
              "state": null,
              "template": "select-form-control.hbs",
              "type": {
                "defaultImport": null,
                "isTypeOnly": false,
                "moduleSpecifier": null,
                "name": "unknown",
                "namedImport": null,
                "namespaceImport": null
              },
              "upstream": null,
              "validatorList": []
            }
          ],
          "identifier": null,
          "matFormFieldDefaultOptions": null,
          "role": null,
          "window": false
        },
        "icon": "add",
        "kind": "form",
        "label": "Add Member",
        "permission": null,
        "refresh": false,
        "successMessage": null,
        "svgIcon": null,
        "tooltip": null
      },
      "identifier": null,
      "modifiers": [
        "with-header"
      ],
      "name": "workspace-member",
      "nestModule": "workspace-member",
      "openApi": null,
      "overwrite": false,
      "prefix": null,
      "project": "ui-admin",
      "propertyList": [
        {
          "active": false,
          "cssClass": null,
          "filterControl": null,
          "filterCssClass": null,
          "filterName": "filter_email",
          "handlebars": expect.any(Function),
          "hasFilter": false,
          "headerCssClass": null,
          "hidden": false,
          "importList": [],
          "inactive": false,
          "isArray": false,
          "isOptional": false,
          "kind": "default",
          "memberList": [],
          "modifiers": [],
          "name": "email",
          "nowrap": false,
          "pipeList": [],
          "propertyPath": "email",
          "show": false,
          "sortable": false,
          "source": null,
          "sticky": null,
          "stickyEnd": false,
          "stickyStart": false,
          "synthetic": false,
          "template": "default-table-column.hbs",
          "title": "Email",
          "type": {
            "defaultImport": null,
            "isTypeOnly": false,
            "moduleSpecifier": null,
            "name": "unknown",
            "namedImport": null,
            "namespaceImport": null
          },
          "withoutTitle": false
        },
        {
          "active": false,
          "cssClass": null,
          "filterControl": null,
          "filterCssClass": null,
          "filterName": "filter_displayName",
          "handlebars": expect.any(Function),
          "hasFilter": false,
          "headerCssClass": null,
          "hidden": false,
          "importList": [],
          "inactive": false,
          "isArray": false,
          "isOptional": false,
          "kind": "default",
          "memberList": [],
          "modifiers": [],
          "name": "displayName",
          "nowrap": false,
          "pipeList": [],
          "propertyPath": "displayName",
          "show": false,
          "sortable": false,
          "source": null,
          "sticky": null,
          "stickyEnd": false,
          "stickyStart": false,
          "synthetic": false,
          "template": "default-table-column.hbs",
          "title": "Name",
          "type": {
            "defaultImport": null,
            "isTypeOnly": false,
            "moduleSpecifier": null,
            "name": "string",
            "namedImport": null,
            "namespaceImport": null
          },
          "withoutTitle": false
        },
        {
          "active": false,
          "cssClass": null,
          "filterControl": null,
          "filterCssClass": null,
          "filterName": "filter_role",
          "handlebars": expect.any(Function),
          "hasFilter": false,
          "headerCssClass": null,
          "hidden": false,
          "importList": [
            {
              "defaultImport": null,
              "isTypeOnly": false,
              "moduleSpecifier": "@rxap/material-table-system",
              "name": "OptionsCellComponent",
              "namedImport": null,
              "namespaceImport": null
            },
            {
              "defaultImport": null,
              "isTypeOnly": false,
              "moduleSpecifier": "@angular/material/core",
              "name": "MatOptionModule",
              "namedImport": null,
              "namespaceImport": null
            }
          ],
          "inactive": false,
          "isArray": false,
          "isOptional": false,
          "kind": "options",
          "memberList": [],
          "modifiers": [],
          "name": "role",
          "nowrap": false,
          "optionList": [
            {
              "display": "Admin",
              "value": "admin"
            },
            {
              "display": "Reviewer",
              "value": "reviewer"
            },
            {
              "display": "Editor",
              "value": "editor"
            }
          ],
          "pipeList": [],
          "propertyPath": "role",
          "show": false,
          "sortable": false,
          "source": null,
          "sticky": null,
          "stickyEnd": false,
          "stickyStart": false,
          "synthetic": false,
          "template": "options-table-column.hbs",
          "title": "Role",
          "type": {
            "defaultImport": null,
            "isTypeOnly": false,
            "moduleSpecifier": null,
            "name": "unknown",
            "namedImport": null,
            "namespaceImport": null
          },
          "withoutTitle": false
        }
      ],
      "replace": false,
      "rowId": null,
      "scope": null,
      "selectColumn": false,
      "shared": false,
      "sortable": {
        "default": null,
        "enabled": false
      },
      "tableMethod": null,
      "title": "Workspace Member",
      "upstream": null,
      "withHeader": true
    });

  });

});
