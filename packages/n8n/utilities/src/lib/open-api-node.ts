import { CaptureExecutionError } from './capture-execution-error.decorator';
import {
  capitalize,
  classify,
  dasherize,
  DeleteUndefinedProperties,
} from '@rxap/utilities';
import FormData = require('form-data');
import {
  existsSync,
  readFileSync,
} from 'fs';
import {
  Icon,
  INodeExecutionData,
  INodeProperties,
  INodePropertyCollection,
  INodePropertyOptions,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
  NodePropertyTypes,
} from 'n8n-workflow';
import {
  IExecuteFunctions,
  IHttpRequestMethods,
  IRequestOptions,
} from 'n8n-workflow/dist/Interfaces';
import { OpenAPIV3 } from 'openapi-types';
import {
  dirname,
  join,
} from 'path';
import { v4 as uuid } from 'uuid';

type Operation = OpenAPIV3.OperationObject<any> & { path: string, method: string }

function isParameterObject(parameter: any): parameter is OpenAPIV3.ParameterObject {
  return parameter?.in !== undefined && parameter?.name !== undefined;
}

function isSchemaObject(schema: any): schema is OpenAPIV3.SchemaObject {
  return schema?.type !== undefined;
}

function isRequestBodyObject(requestBody: any): requestBody is OpenAPIV3.RequestBodyObject {
  return requestBody?.content !== undefined;
}

function hasQueryParameters(operation: Operation): boolean {
  return operation.parameters?.filter(isParameterObject).some(
    (parameter: OpenAPIV3.ParameterObject) => parameter.in === 'query') ?? false;
}

function hasPathParameters(operation: Operation): boolean {
  return operation.parameters?.filter(isParameterObject).some(
    (parameter: OpenAPIV3.ParameterObject) => parameter.in === 'path') ?? false;
}

function hasHeaderParameters(operation: Operation): boolean {
  return operation.parameters?.filter(isParameterObject).some(
    (parameter: OpenAPIV3.ParameterObject) => parameter.in === 'header') ?? false;
}

type Schema = OpenAPIV3.SchemaObject & { id?: string };

export function ResolveRef(openApiSpec: OpenAPIV3.Document, node: any, parent?: any, key?: string) {
  if (typeof node !== 'object' || node === null) {
    return;
  }
  if (node['$ref']) {
    if (node.$ref.startsWith('#/components/schemas')) {
      const name = node.$ref.replace('#/components/schemas/', '');
      if (parent && key && openApiSpec.components?.schemas) {
        parent[key] = openApiSpec.components.schemas[name];
        ResolveRef(openApiSpec, parent[key], parent, key);
      }
    }
  } else {
    for (const [ k, v ] of Object.entries(node)) {
      ResolveRef(openApiSpec, v, node, k);
    }
  }
}

export abstract class OpenApiNode implements INodeType {

  description: INodeTypeDescription;

  protected tags: string[];
  protected operationMethods: string[];
  protected operations: Operation[];
  protected openapi: OpenAPIV3.Document;

  constructor(
    private readonly openApiFilePath: string,
    description: Partial<INodeTypeDescription> = {},
    nameSuffix = '',
  ) {
    this.openapi = this.loadOpenApiFile();
    ResolveRef(this.openapi, this.openapi.paths);
    this.operations = this.extractOperationList(this.openapi);
    this.tags = this.extractTags(this.operations);
    this.operationMethods = this.extractMethods(this.operations);

    // use || instead of ?? to ensure an empty string is also replaced
    let name = description.name || dasherize(this.openapi.info?.title || this.constructor.name);
    if (nameSuffix) {
      name += `-${ nameSuffix }`;
    }
    this.description = {
      version: 1,
      // use || instead of ?? to ensure an empty string is also replaced
      description: this.openapi.info?.description || capitalize(this.constructor.name),
      defaults: {
        name
      },
      inputs: [ NodeConnectionType.Main ],
      outputs: [ NodeConnectionType.Main ],
      subtitle: '={{ "[" + $parameter["method"].toUpperCase() + "] " + $parameter["operation"] + ": " + $parameter["tag"] }}',
      // use || instead of ?? to ensure an empty string is also replaced
      displayName: this.openapi.info?.title || capitalize(this.constructor.name),
      group: ['input'],
      credentials: [
        {
          displayName: 'Bearer Auth',
          name: 'httpBearerAuth',
          required: false,
          displayOptions: {
            show: {
              authentication: ['httpBearerAuth'],
            },
          },
        },
        {
          displayName: 'OAuth 2 Proxy Auth',
          name: 'oauth2ProxyAuth',
          required: false,
          displayOptions: {
            show: {
              authentication: ['oauth2ProxyAuth'],
            },
          },
        },
        {
          displayName: 'Basic Auth',
          name: 'httpBasicAuth',
          required: false,
          displayOptions: {
            show: {
              authentication: ['httpBasicAuth'],
            },
          },
        },
        {
          displayName: 'Custom Auth',
          name: 'httpCustomAuth',
          required: false,
          displayOptions: {
            show: {
              authentication: ['httpCustomAuth'],
            },
          },
        },
        {
          displayName: 'Digest Auth',
          name: 'httpDigestAuth',
          required: false,
          displayOptions: {
            show: {
              authentication: ['httpDigestAuth'],
            },
          },
        },
        {
          displayName: 'Header Auth',
          name: 'httpHeaderAuth',
          required: false,
          displayOptions: {
            show: {
              authentication: ['httpHeaderAuth'],
            },
          },
        },
      ],
      icon: this.getIcon(),
      ...DeleteUndefinedProperties(description),
      properties: description.properties ?? [],
      name,
    };
    this.populateDescription();

  }

  @CaptureExecutionError()
  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {

    const items = this.getInputData();

    const results: INodeExecutionData[] = Array(items.length).fill(null);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const skipAuthentication = this.getNodeParameter('skipAuthentication', i) as boolean;

      // eslint-disable-next-line no-inner-declarations
      function isEmpty(value: any): boolean {
        return !value && value !== 0 && value !== false;
      }

      const requestOptions: IRequestOptions = {
        baseURL: this.getNodeParameter('baseUrl', i) as string,
        method: (
          this.getNodeParameter('method', i) as string
        ).toUpperCase() as IHttpRequestMethods,
        url: this.getNodeParameter('path', i) as string,
      };

      const operationParameters = this.getNodeParameter('parameterSchema', i, []) as OpenAPIV3.ParameterObject[];
      const operationRequestBody = this.getNodeParameter('requestBodySchema', i, {}) as OpenAPIV3.RequestBodyObject;

      // region build parameters
      if (operationParameters?.some((p: any) => isParameterObject(p) && p.in === 'path')) {
        const pathParameters = this.getNodeParameter('pathParameters', i) as Record<string, any>;
        requestOptions.url = requestOptions.url!.replace(/{([^}]+)}/g, (_: any, name: string) => {
          if (isEmpty(pathParameters[name])) {
            throw new Error(`The path parameter "${ name }" is missing.`);
          }
          return encodeURIComponent(pathParameters[name]);
        });
      }
      if (operationParameters?.some((p: any) => isParameterObject(p) && p.in === 'query')) {
        requestOptions.qs ??= {};
        const queryParameters = this.getNodeParameter('queryParameters', i) as Record<string, any>;
        for (const queryParam of operationParameters.filter(isParameterObject).filter(
          (p: OpenAPIV3.ParameterObject) => p.in === 'query')) {
          if (isEmpty(queryParameters[queryParam.name])) {
            if (queryParam.required) {
              throw new Error(`The query parameter "${ queryParam.name }" is missing.`);
            }
          } else {
            requestOptions.qs[queryParam.name] = encodeURIComponent(queryParameters[queryParam.name]);
          }
        }
      }
      if (operationParameters?.some((p: any) => isParameterObject(p) && p.in === 'header')) {
        requestOptions.headers ??= {};
        const headerParameters = this.getNodeParameter('headerParameters', i) as Record<string, any>;
        for (const headerParam of operationParameters.filter(isParameterObject).filter(
          (p: OpenAPIV3.ParameterObject) => p.in === 'header')) {
          if (isEmpty(headerParameters[headerParam.name])) {
            if (headerParam.required) {
              throw new Error(`The header parameter "${ headerParam.name }" is missing.`);
            }
          } else {
            requestOptions.headers[headerParam.name] = headerParameters[headerParam.name];
          }
        }
      }
      // endregion

      // region build request body
      if (isRequestBodyObject(operationRequestBody)) {
        const mediaType = this.getNodeParameter('mediaType', i) as string;
        const requestBody = this.getNodeParameter('requestBody', i) as Record<string, any>;
        switch (mediaType) {
          default:
          case 'application/json':
            requestOptions.body = requestBody;
            break;
          case 'plain/text':
            requestOptions.body = JSON.stringify(requestBody);
            break;
          case 'multipart/form-data':
            // eslint-disable-next-line no-case-declarations
            const schema = operationRequestBody.content['multipart/form-data'].schema;
            if (isSchemaObject(schema)) {
              const formData = requestOptions.formData = new FormData();
              for (const key of Object.keys(schema.properties ?? {})) {
                const prop = schema.properties?.[key];
                if (isSchemaObject(prop)) {
                  if (isEmpty(requestBody[key])) {
                    throw new Error(`The multipart form data parameter "${ key }" is missing.`);
                  }
                  if (prop.format === 'binary') {
                    const data = item.binary?.[requestBody[key]];
                    if (!data) {
                      throw new Error(`The binary data for the multipart form data parameter "${ key }" is missing.`);
                    }
                    const buffer = await this.helpers.getBinaryDataBuffer(i, requestBody[key]);
                    const options = DeleteUndefinedProperties({ filename: data.fileName, filepath: data.directory, contentType: data.mimeType });
                    if (!buffer) {
                      throw new NodeOperationError(this.getNode(), 'No binary data found.');
                    }
                    if (!options.filename) {
                      throw new NodeOperationError(this.getNode(), `The filename for the binary data '${ key }' is missing.`);
                    }
                    formData.append(key, buffer, options);
                  } else {
                    formData.append(key, requestBody[key]);
                  }
                }
              }
            } else {
              requestOptions.formData = requestBody;
            }
            break;

        }
        requestOptions.headers ??= {};
        requestOptions.headers['Content-Type'] = mediaType;
      }
      // endregion

      let response: any;

      if (skipAuthentication) {
        response = await this.helpers.request(requestOptions);
      } else {
        const authentication = this.getNodeParameter('authentication', i) as string;
        if (authentication) {
          const credentials = await this.getCredentials(authentication);
          if ('baseURL' in credentials && credentials['baseURL'] && typeof credentials['baseURL'] === 'string') {
            requestOptions.baseURL = credentials['baseURL'] as string;
          }
          if ('baseUrl' in credentials && credentials['baseUrl'] && typeof credentials['baseUrl'] === 'string') {
            requestOptions.baseURL = credentials['baseUrl'] as string;
          }
          this.logger.debug('Request options: ' + JSON.stringify(requestOptions, undefined, 2));
          response = await this.helpers.requestWithAuthentication.call(
            this, authentication, requestOptions, undefined, i);
        } else {
          throw new Error('No authentication method selected.');
        }
      }

      let data = response instanceof Buffer ? JSON.parse(response.toString()) : response;
      let isJSON = false;
      try {
        data = JSON.parse(data);
        isJSON = true;
      } catch (e) {
        // ignore
      }
      if (isJSON) {
        const spread = this.getNodeParameter('spread', i, false) as boolean;
        if (spread) {
          let rows: any[] = [];
          if (Array.isArray(data)) {
            rows = data.map(item => (
              { json: item }
            ));
          } else if (Array.isArray(data.rows)) {
            rows = data.rows.map((item: any) => (
              { json: item }
            ));
          }
          if (rows.length) {
            results[i] = rows.shift();
            results.push(...rows);
          }
        } else {
          results[i] = { json: data };
        }
      } else {
        results[i] = { json: { response: data } };
      }

    }

    return [results.filter(Boolean)];


  }

  protected populateDescription(): void {
    this.description.properties.unshift(...this.buildBaseUrlParameters());
    this.description.credentials ??= [];
    this.description.properties.unshift({
      displayName: 'Authentication',
      name: 'authentication',
      type: this.description.credentials.length > 1 ? 'options' : 'hidden',
      options: this.description.credentials.map(credential => ({
        value: credential.name,
        name: credential.displayName ?? classify(credential.name),
      })),
      default: this.description.credentials[0].name,
      displayOptions: {
        hide: {
          skipAuthentication: [ true ],
        }
      },
    });
    this.description.properties.unshift({
      displayName: 'Skip Authentication',
      name: 'skipAuthentication',
      type: 'boolean',
      default: false,
    });
    this.description.properties.push(this.buildTagProperty(this.tags, this.operations.some(o => !o.tags?.length)));
    this.description.properties.push(this.buildMethodProperty(this.operationMethods));
    for (const tag of this.tags) {
      const property = this.buildOperationProperty(this.operations, tag);
      if (property) {
        this.description.properties.push(...property);
      }
    }
    const property = this.buildOperationProperty(this.operations.filter(o => !o.tags?.length));
    if (property) {
      this.description.properties.push(...property);
    }
    for (const operation of this.operations) {
      if (hasQueryParameters(operation)) {
        this.description.properties.push(this.buildOperationQueryParameterProperties(operation));
      }
      if (hasPathParameters(operation)) {
        this.description.properties.push(this.buildOperationPathParameterProperties(operation));
      }
      if (hasHeaderParameters(operation)) {
        this.description.properties.push(this.buildOperationHeaderParameterProperties(operation));
      }
      if (isRequestBodyObject(operation.requestBody)) {
        this.description.properties.push(...this.buildOperationRequestBodyProperties(operation));
      }
    }
    this.buildArrayResponseHandlerProperty(this.operations);
    this.buildPagedResponseHandlerProperty(this.operations);
  }

  private buildArrayResponseHandlerProperty(operationList: Operation[]): INodeProperties {
    // filter operation that have an array response
    operationList = operationList.filter(
      operation => operation.responses['200']?.content?.['application/json']?.schema?.type === 'array');
    return {
      name: 'spread',
      displayName: 'Spread Response',
      default: true,
      description: 'The items of the array response will be spread into individual items.',
      type: 'boolean',
      displayOptions: {
        show: {
          operation: operationList.map(o => o.operationId),
        },
      },
    };
  }

  private buildPagedResponseHandlerProperty(operationList: Operation[]): INodeProperties {
    // filter operation that have an array response
    operationList = operationList.filter(operation => {
      const schema = operation.responses['200']?.content?.['application/json']?.schema;
      if (schema?.type === 'object') {
        return schema.properties?.rows?.type === 'array';
      }
      return false;
    });
    return {
      name: 'spread',
      displayName: 'Spread Response',
      default: true,
      description: 'The items of the rows array response will be spread into individual items.',
      type: 'boolean',
      displayOptions: {
        show: {
          operation: operationList.map(o => o.operationId),
        },
      },
    };
  }

  protected buildBaseUrlParameters(): INodeProperties[] {
    const parameters: INodeProperties[] = [];

    const options = this.openapi.servers?.map(server => ({
      name: server.description ? capitalize(server.description) : server.url,
      value: server.url,
    })) ?? [];
    if (options.length) {
      parameters.push({
        displayName: 'Base URL',
        name: 'baseUrl',
        type: 'options',
        options,
        default: options[0].value,
        validateType: 'string',
      });
    } else {
      parameters.push({
        displayName: 'Base URL',
        name: 'baseUrl',
        type: 'string',
        default: '',
      });
    }
    return parameters;
  }

  private getIcon(): Icon | undefined {
    const basePath = dirname(this.openApiFilePath);
    if (existsSync(join(basePath, `${this.constructor.name}.png`))) {
      return `file:${this.constructor.name}.png`;
    }
    if (existsSync(join(basePath, `${this.constructor.name}.svg`))) {
      if (existsSync(join(basePath, `${this.constructor.name}.dark.svg`))) {
        return { light: `file:${ this.constructor.name }.svg`, dark: `file:${ this.constructor.name }.dark.svg` };
      } else {
        return `file:${ this.constructor.name }.svg`;
      }
    }
    if (this.constructor.name.startsWith('Service')) {
      return { light: `file:${this.constructor.name}.png`, dark: `file:${this.constructor.name}.dark.png` };
    }
    return undefined;
  }

  private buildApplicationJsonProperty(operation: Operation): INodeProperties {
    const schema = operation.requestBody!.content['application/json'].schema;
    return {
      ...this.buildPropertyForSchema(null, schema),
      displayName: 'Request Body',
      name: 'requestBody',
      displayOptions: {
        show: {
          operation: [ operation.operationId ],
          mediaType: [ 'application/json' ],
        },
      },
    };
  }

  private buildPlainTextProperty(operation: Operation): INodeProperties {
    return {
      displayName: 'Request Body',
      name: 'requestBody',
      type: 'string',
      displayOptions: {
        show: {
          operation: [ operation.operationId ],
          mediaType: [ 'plain/text' ],
        },
      },
      typeOptions: {
        rows: 4,
      },
      default: '',
    };
  }

  private buildMultipartFormDataProperty(operation: Operation, mediaType: OpenAPIV3.MediaTypeObject): INodeProperties {
    const options: Array<INodePropertyOptions | INodeProperties | INodePropertyCollection> = [];
    const schema = mediaType.schema;
    let defaults = {};
    if (isSchemaObject(schema)) {
      for (const [ key, value ] of Object.entries(schema.properties ?? {})) {
        if (isSchemaObject(value)) {
          options.push({
            displayName: capitalize(key),
            name: key,
            type: this.schemaToNodePropertyType(value),
            default: '',
          });
        }
      }
      if (Object.keys(schema.properties ?? {}).length === 1) {
        const propertyKey = Object.keys(schema.properties ?? {})[0];
        defaults = {
          [Object.keys(schema.properties ?? {})[0]]: propertyKey === 'file' ? 'data' : '',
        };
      }
    }
    return {
      displayName: 'Request Body',
      name: 'requestBody',
      type: 'collection',
      displayOptions: {
        show: {
          operation: [ operation.operationId ],
          mediaType: [ 'multipart/form-data' ],
        },
      },
      default: defaults,
      options,
    };
  }

  private buildOperationRequestBodyProperties(operation: Operation): INodeProperties[] {
    const mediaTypes = Object.keys(operation.requestBody.content);
    const properties: INodeProperties[] = [
      {
        displayName: 'Media Type',
        name: 'mediaType',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            operation: [ operation.operationId ],
          },
        },
        default: mediaTypes[0],
        options: mediaTypes.map(mediaType => (
          {
            value: mediaType,
            name: mediaType,
          }
        )),
      },
    ];

    for (const mediaType of mediaTypes) {
      switch (mediaType) {

        case 'application/json':
          properties.push(this.buildApplicationJsonProperty(operation));
          break;

        case 'plain/text':
          properties.push(this.buildPlainTextProperty(operation));
          break;

        case 'multipart/form-data':
          properties.push(
            this.buildMultipartFormDataProperty(operation, operation.requestBody.content['multipart/form-data']));
          break;

        default:
          properties.push({
            displayName: 'Request Body',
            name: 'requestBody',
            type: 'string',
            displayOptions: {
              show: {
                operation: [ operation.operationId ],
                mediaType: [ mediaType ],
              },
            },
            typeOptions: {
              rows: 4,
            },
            default: '',
          });
          break;

      }
    }

    return properties;
  }

  // region Query, Path, and Header Parameters

  private schemaToNodePropertyType(schema: OpenAPIV3.SchemaObject): NodePropertyTypes {
    switch (schema.type) {

      case 'boolean':
        return 'boolean';

      case 'number':
      case 'integer':
        return 'number';

      default:
      case 'string':
        return 'string';

    }
  }

  private buildOperationQueryParameterProperties(operation: Operation): INodeProperties {
    const parameters: OpenAPIV3.ParameterObject[] = operation.parameters
      ?.filter(isParameterObject)
      .filter((p: OpenAPIV3.ParameterObject) => p.in === 'query');
    return {
      displayName: 'Query Parameters',
      name: 'queryParameters',
      type: 'collection',
      default: parameters.filter(p => p.required).reduce((acc, p) => (
        {
          ...acc,
          [p.name]: null,
        }
      ), {}),
      displayOptions: {
        show: {
          operation: [ operation.operationId ],
        },
      },
      options: parameters.map(p => (
        {
          displayName: capitalize(p.name),
          name: p.name,
          type: isSchemaObject(p.schema) ? this.schemaToNodePropertyType(p.schema) : 'string',
          default: '',
        }
      )) ?? [],
    };
  }

  private buildOperationPathParameterProperties(operation: Operation): INodeProperties {
    const parameters: OpenAPIV3.ParameterObject[] = operation.parameters
      ?.filter(isParameterObject)
      .filter((p: OpenAPIV3.ParameterObject) => p.in === 'path');
    return {
      displayName: 'Path Parameters',
      name: 'pathParameters',
      type: 'collection',
      default: parameters.filter(p => p.required).reduce((acc, p) => (
        {
          ...acc,
          [p.name]: null,
        }
      ), {}),
      displayOptions: {
        show: {
          operation: [ operation.operationId ],
        },
      },
      options: parameters.map(p => (
        {
          displayName: capitalize(p.name),
          name: p.name,
          type: isSchemaObject(p.schema) ? this.schemaToNodePropertyType(p.schema) : 'string',
          default: '',
        }
      )) ?? [],
    };
  }

  // endregion

  private buildOperationHeaderParameterProperties(operation: Operation): INodeProperties {
    const parameters: OpenAPIV3.ParameterObject[] = operation.parameters
      ?.filter(isParameterObject)
      .filter((p: OpenAPIV3.ParameterObject) => p.in === 'header');
    return {
      displayName: 'Header Parameters',
      name: 'headerParameters',
      type: 'collection',
      default: parameters.filter(p => p.required).reduce((acc, p) => (
        {
          ...acc,
          [p.name]: null,
        }
      ), {}),
      displayOptions: {
        show: {
          operation: [ operation.operationId ],
        },
      },
      options: parameters.map(p => (
        {
          displayName: capitalize(p.name),
          name: p.name,
          type: isSchemaObject(p.schema) ? this.schemaToNodePropertyType(p.schema) : 'string',
          default: '',
        }
      )) ?? [],
    };
  }

  private buildOperationProperty(operationList: Operation[], tag?: string): INodeProperties[] | null {
    // Filter the operation list by the selected tag. If no tag is selected, return the full list.
    operationList = tag ?
                    operationList.filter(operation => operation.tags?.includes(tag)) :
                    operationList;
    tag ??= 'any';
    if (operationList.length === 0) {
      return null;
    }
    const parameters: INodeProperties[] = [
      {
      displayName: 'Operation',
      name: 'operation',
      type: 'options',
      default: operationList[0].operationId,
      displayOptions: {
        show: {
          resource: [ tag ],
        },
      },
      options: operationList.map(operation => (
        {
          name: operation.name ?? operation.operationId,
          value: operation.operationId,
          description: operation.description,
          action: operation.summary ?? operation.operationId,
          displayName: operation.summary ?? operation.name,
          displayOptions: {
            show: {
              method: [ operation.method ],
            }
          },
        }
      )),
      }
    ];

    for (const operation of operationList) {
      parameters.push({
        displayOptions: {
          show: {
            operation: [ operation.operationId ],
          }
        },
        displayName: 'Parameter Schema',
        name: 'parameterSchema',
        default: operation.parameters,
        type: 'hidden',
      });
      parameters.push({
        displayOptions: {
          show: {
            operation: [ operation.operationId ],
          }
        },
        displayName: 'Request Body Schema',
        name: 'requestBodySchema',
        default: operation.requestBody,
        type: 'hidden',
      });
      parameters.push({
        displayOptions: {
          show: {
            operation: [ operation.operationId ],
          }
        },
        displayName: 'Request Path',
        name: 'path',
        default: operation.path,
        type: 'hidden',
      });
    }

    return parameters;
  }

  private buildTagProperty(tags: string[], withAnyTag: boolean): INodeProperties {
    const options = tags.map(tag => (
      {
        name: tag.split('-').map(capitalize).join(' '),
        value: tag,
      }
    ));
    if (withAnyTag) {
      options.unshift({
        name: 'Any',
        value: 'any',
      });
    }
    return {
      // The displayName and name must be 'resource' so that in the n8n UI the different operations are
      // shown in a grouped fashion
      displayName: 'Resource',
      name: 'resource',
      type: 'options',
      noDataExpression: true,
      options,
      default: withAnyTag ? 'any' : tags[0],
    };
  }

  private buildMethodProperty(methods: string[]): INodeProperties {
    return {
      displayName: 'Method',
      name: 'method',
      type: 'options',
      noDataExpression: true,
      options: methods.map(method => (
        {
          name: method.toUpperCase(),
          value: method,
        }
      )),
      default: methods[0],
    };
  }

  private extractMethods(operations: Operation[]): string[] {
    return Array.from(new Set(operations.map(operation => operation.method)));
  }

  private extractTags(operations: Operation[]): string[] {
    return Array.from(new Set(operations.flatMap(operation => operation.tags ?? [])));
  }

  private extractOperationList(openapi: OpenAPIV3.Document): Operation[] {
    const list: Operation[] = [];
    for (const [ path, pathObj ] of Object.entries(openapi.paths)) {
      for (const [ method, operation ] of Object.entries(pathObj as OpenAPIV3.PathItemObject)) {
        if (typeof operation === 'object') {
          list.push({
            path,
            method,
            ...operation,
          });
        }
      }
    }
    return list;
  }

  private loadOpenApiFile(): OpenAPIV3.Document {

    const filePath = this.openApiFilePath;

    if (!existsSync(filePath)) {
      throw new Error(`The OpenAPI file "${ filePath }" does not exist.`);
    }

    return JSON.parse(readFileSync(filePath, 'utf8'));
  }

  // region schema to n8n node properties
  private buildPropertyForSchema(propertyName: string | null, schema: Schema): INodeProperties {
    switch (schema.type) {

      case 'string':
      case 'number':
      case 'boolean':
        return this.buildPropertyForSchemaPrimitive(propertyName, schema as any);

      case 'array':
        return this.buildPropertyForSchemaArray(propertyName, schema as any);

      case 'object':
        return this.buildPropertyForSchemaObject(propertyName, schema as any);

      default:
        if (Object.keys(schema.properties ?? {}).length) {
          return this.buildPropertyForSchemaObject(propertyName, schema as any);
        }
        if ((schema as any).items) {
          return this.buildPropertyForSchemaArray(propertyName, schema as any);
        }
        return {
          name: propertyName ? propertyName :'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'string',
          default: '',
          description: schema.description,
        };
    }
  }

  private buildStringPropertyDefault(schema: Schema & { type: 'string' }) {
    switch (schema.format) {
      case 'uuid':
        return uuid();
      default:
        return schema.default ?? '';
    }
  }

  private buildPropertyForSchemaPrimitive(propertyName: string | null, schema: Schema & { type: 'string' | 'number' | 'boolean' }): INodeProperties {
    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return {
            name: propertyName ? propertyName :'payload',
            displayName: propertyName ? schema.title ?? propertyName : 'Payload',
            type: 'options',
            default: schema.default ?? '',
            description: schema.description,
            options: schema.enum.map((value) => ({ name: value, value })),
          };
        }
        return {
          name: propertyName ? propertyName :'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'string',
          default: this.buildStringPropertyDefault(schema as any),
          description: schema.description,
        };

      case 'number':
        return {
          name: propertyName ? propertyName :'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'number',
          default: schema.default ?? 0,
          description: schema.description,
        };

      case 'boolean':
        return {
          name: propertyName ? propertyName :'payload',
          displayName: propertyName ? schema.title ?? propertyName : 'Payload',
          type: 'boolean',
          default: schema.default ?? false,
          description: schema.description,
        };

      default:
        throw new Error(`Unsupported primitive schema type: ${ schema.type }`);
    }
  }

  private buildPropertyForSchemaArray(propertyName: string | null, schema: Schema & { type: 'array' }): INodeProperties {
    const items = (schema.items ?? {}) as Schema;
    let options: Array<INodeProperties> = [];
    if (Object.keys(items).length) {
      options = [this.buildPropertyForSchema('item', items)];
    } else {
      options = [
        {
          name: 'item',
          displayName: 'Item',
          type: 'json',
          default: '',
        }
      ];
    }
    return {
      name: propertyName ? propertyName :'payload',
      displayName: propertyName ? schema.title ?? propertyName : 'Payload',
      description: schema.description,
      type: 'fixedCollection',
      default: schema.default ?? [],
      typeOptions: {
        multipleValues: true,
      },
      options: [
        {
          name: 'item',
          displayName: 'Item',
          values: options,
        }
      ]
    };

  }

  private buildPropertyDefault(schema: Schema & { type: 'object' }) {
    const defaultObj: Record<string, any> = schema.default ?? {};
    for (const propertyName of schema.required ?? []) {
      const property = schema.properties?.[propertyName] as OpenAPIV3.SchemaObject | undefined;
      switch (property?.type) {
        case 'string':
        case 'number':
        case 'boolean':
          if (defaultObj[propertyName] === undefined) {
            defaultObj[propertyName] = null;
          }
          break;
        case 'object':
          if (defaultObj[propertyName] === undefined) {
            defaultObj[propertyName] = {};
          }
          break;
      }
    }
    // remove empty arrays from the default object
    for (const [ key, value ] of Object.entries(defaultObj)) {
      if (Array.isArray(value) && value.length === 0) {
        delete defaultObj[key];
      }
    }
    return defaultObj;
  }

  private buildPropertyForSchemaObject(propertyName: string | null, schema: Schema & { type: 'object' }): INodeProperties {
    return {
      name: propertyName ? propertyName :'payload',
      displayName: propertyName ? schema.title ?? propertyName : 'Payload',
      type: 'collection',
      default: this.buildPropertyDefault(schema),
      description: schema.description,
      options: Object.entries(schema.properties ?? {}).map(([ propertyName, schema]) => this.buildPropertyForSchema(propertyName, schema as any)),
    };
  }
  // endregion

}
