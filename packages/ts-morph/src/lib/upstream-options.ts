import { Normalized } from '@rxap/utilities';

export enum UpstreamOptionsKinds {
  OPEN_API = 'open-api',
}

export type UpstreamOptions = OpenApiUpstreamOptions | BaseUpstreamOptions;

export type NormalizedUpstreamOptions = NormalizedOpenApiUpstreamOptions | NormalizedBaseUpstreamOptions;

// region BaseUpstreamOptions

export interface BaseUpstreamOptions {
  kind: UpstreamOptionsKinds;
}

export interface NormalizedBaseUpstreamOptions extends Readonly<Normalized<BaseUpstreamOptions>> {
  kind: UpstreamOptionsKinds;
}

export function NormalizeBaseUpstreamOptions(options: BaseUpstreamOptions): NormalizedBaseUpstreamOptions {
  return Object.freeze({
    kind: options.kind,
  });
}

// endregion

// region CommandMapper

export interface CommandMapper {
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

export interface NormalizedCommandMapper extends Readonly<Normalized<CommandMapper>> {
  filter: {
    eq: string;
    join: string;
  } | null;
}

export function NormalizeCommandMapper(mapper?: CommandMapper | null): NormalizedCommandMapper | null {
  if (!mapper || Object.keys(mapper).length === 0) {
    return null;
  }
  return Object.freeze({
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

// endregion

// region OpenApiUpstreamOptions

export interface OpenApiUpstreamOptions extends BaseUpstreamOptions {
  operationId: string;
  scope?: string;
  mapper?: CommandMapper;
}

export interface NormalizedOpenApiUpstreamOptions extends Readonly<Normalized<OpenApiUpstreamOptions>> {
  kind: UpstreamOptionsKinds.OPEN_API;
}

export function NormalizeOpenApiUpstreamOptions(options: OpenApiUpstreamOptions): NormalizedOpenApiUpstreamOptions {
  return Object.freeze({
    ...NormalizeBaseUpstreamOptions(options),
    kind: UpstreamOptionsKinds.OPEN_API,
    operationId: options.operationId,
    mapper: NormalizeCommandMapper(options.mapper),
    scope: options.scope ?? null,
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
