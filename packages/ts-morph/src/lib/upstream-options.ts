import { Normalized } from '@rxap/utilities';

export enum UpstreamOptionsKinds {
  OPEN_API = 'open-api',
}

export type UpstreamOptions = OpenApiUpstreamOptions | BaseUpstreamOptions;

export type NormalizedUpstreamOptions = NormalizedOpenApiUpstreamOptions | NormalizedBaseUpstreamOptions;

// region BaseUpstreamOptions

export interface BaseUpstreamOptions {
  kind: UpstreamOptionsKinds;
  mapper?: RequestMapper;
}

export interface NormalizedBaseUpstreamOptions<Mapper extends NormalizedRequestMapper = NormalizedRequestMapper> extends Readonly<Normalized<BaseUpstreamOptions>> {
  kind: UpstreamOptionsKinds;
  mapper: Mapper | null;
}

export function NormalizeBaseUpstreamOptions(options: BaseUpstreamOptions): NormalizedBaseUpstreamOptions {
  return Object.freeze({
    kind: options.kind,
    mapper: NormalizeRequestMapper(options.mapper) as NormalizedBaseRequestMapper | null,
  });
}

// endregion

// region RequestMapper

export type RequestMapper = PagedRequestMapper | BaseRequestMapper | OptionsRequestMapper | ResolveRequestMapper;

export type NormalizedRequestMapper = NormalizedPagedRequestMapper | NormalizedBaseRequestMapper | NormalizedOptionsRequestMapper | NormalizedResolveRequestMapper;

export function NormalizeRequestMapper(mapper?: RequestMapper | null): NormalizedRequestMapper | null {
  if (!mapper || Object.keys(mapper).length === 0) {
    return null;
  }
  switch (mapper.kind) {
    default:
    case RequestMapperKinds.DEFAULT:
      return NormalizeBaseRequestMapper(mapper);
    case RequestMapperKinds.PAGED:
      return NormalizePagedRequestMapper(mapper);
    case RequestMapperKinds.OPTIONS:
      return NormalizeOptionsRequestMapper(mapper);
    case RequestMapperKinds.Resolve:
      return NormalizeResolveRequestMapper(mapper);
  }

}

// endregion

// region BaseRequestMapper

export enum RequestMapperKinds {
  DEFAULT = 'default',
  PAGED = 'paged',
  OPTIONS = 'options',
  Resolve = 'resolve',
}

export interface BaseRequestMapper {
  kind: RequestMapperKinds;
}

export interface NormalizedBaseRequestMapper extends Readonly<Normalized<BaseRequestMapper>> {
  kind: RequestMapperKinds.DEFAULT;
}

export function NormalizeBaseRequestMapper(mapper: BaseRequestMapper): NormalizedBaseRequestMapper {
  return Object.freeze({
    kind: RequestMapperKinds.DEFAULT,
  });
}

export function IsNormalizedBaseRequestMapper(mapper: NormalizedRequestMapper): mapper is NormalizedBaseRequestMapper {
  return mapper.kind === RequestMapperKinds.DEFAULT;
}

// endregion

// region PagedRequestMapper

export interface PagedRequestMapper extends BaseRequestMapper {
  pageIndex?: string;
  pageSize?: string;
  sortBy?: string;
  sortDirection?: string;
  list?: string;
  total?: string;
  filter?: {
    eq: string;
    join: string;
  }
}

export interface NormalizedPagedRequestMapper extends Readonly<Normalized<PagedRequestMapper>> {
  kind: RequestMapperKinds.PAGED;
  filter: {
    eq: string;
    join: string;
  } | null;
}

export function NormalizePagedRequestMapper(mapper: PagedRequestMapper): NormalizedPagedRequestMapper {
  return Object.freeze({
    ...NormalizeBaseRequestMapper(mapper),
    kind: RequestMapperKinds.PAGED,
    pageIndex: mapper.pageIndex ?? null,
    pageSize: mapper.pageSize ?? null,
    sortBy: mapper.sortBy ?? null,
    list: mapper.list ?? null,
    total: mapper.total ?? null,
    sortDirection: mapper.sortDirection ?? null,
    filter: mapper.filter && Object.keys(mapper.filter ?? {}).length ? {
      eq: mapper.filter.eq,
      join: mapper.filter.join,
    } : null,
  });
}

export function IsNormalizedPagedRequestMapper(mapper: NormalizedRequestMapper): mapper is NormalizedPagedRequestMapper {
  return mapper.kind === RequestMapperKinds.PAGED;
}

// endregion

// region OptionsRequestMapper

export enum ToOptionsFunction {
  TO_OPTIONS = 'ToOptions',
  TO_OPTIONS_FROM_OBJECT = 'ToOptionsFromObject',
}

export interface OptionsRequestMapper extends BaseRequestMapper {
  toFunction?: ToOptionsFunction;
  toValue?: string;
  toDisplay?: string;
}

export interface NormalizedOptionsRequestMapper extends Readonly<Normalized<OptionsRequestMapper>> {
  kind: RequestMapperKinds.OPTIONS;
  toFunction: ToOptionsFunction;
  toDisplay: string;
}

export function NormalizeOptionsRequestMapper(mapper: OptionsRequestMapper): NormalizedOptionsRequestMapper {
  return Object.freeze({
    ...NormalizeBaseRequestMapper(mapper),
    kind: RequestMapperKinds.OPTIONS,
    toFunction: mapper.toFunction ?? ToOptionsFunction.TO_OPTIONS,
    toValue: mapper.toValue ?? 'Number',
    toDisplay: mapper.toDisplay ?? 'String',
  });
}

export function IsNormalizedOptionsRequestMapper(mapper: NormalizedRequestMapper): mapper is NormalizedOptionsRequestMapper {
  return mapper.kind === RequestMapperKinds.OPTIONS;
}

// endregion

// region ResolveRequestMapper

export interface ResolveRequestMapper extends BaseRequestMapper {
  value?: string;
}

export interface NormalizedResolveRequestMapper extends Readonly<Normalized<ResolveRequestMapper>> {
  kind: RequestMapperKinds.Resolve;
}

export function NormalizeResolveRequestMapper(mapper: ResolveRequestMapper): NormalizedResolveRequestMapper {
  return Object.freeze({
    ...NormalizeBaseRequestMapper(mapper),
    kind: RequestMapperKinds.Resolve,
    value: mapper.value ?? null,
  });
}

export function IsNormalizedResolveRequestMapper(mapper: NormalizedRequestMapper): mapper is NormalizedResolveRequestMapper {
  return mapper.kind === RequestMapperKinds.Resolve;
}

// endregion

// region OpenApiUpstreamOptions

export interface OpenApiUpstreamOptions extends BaseUpstreamOptions {
  operationId: string;
  isService?: boolean;
  scope?: string;
}

export interface NormalizedOpenApiUpstreamOptions extends Readonly<Normalized<Omit<OpenApiUpstreamOptions, keyof NormalizedBaseUpstreamOptions>>>, NormalizedBaseUpstreamOptions {
  kind: UpstreamOptionsKinds.OPEN_API;
}

export function NormalizeOpenApiUpstreamOptions(options: OpenApiUpstreamOptions): NormalizedOpenApiUpstreamOptions {
  return Object.freeze({
    ...NormalizeBaseUpstreamOptions(options),
    kind: UpstreamOptionsKinds.OPEN_API,
    operationId: options.operationId,
    scope: options.scope ?? null,
    isService: options.isService ?? false,
  });
}

export function IsNormalizedOpenApiUpstreamOptions(options: NormalizedUpstreamOptions): options is NormalizedOpenApiUpstreamOptions {
  return options.kind === UpstreamOptionsKinds.OPEN_API;
}

// endregion

export function NormalizeUpstreamOptions(options?: UpstreamOptions): NormalizedUpstreamOptions | null {
  if (!options || Object.keys(options).length === 0) {
    return null;
  }
  switch (options.kind) {
    case UpstreamOptionsKinds.OPEN_API:
      return NormalizeOpenApiUpstreamOptions(options as OpenApiUpstreamOptions);
  }
}
