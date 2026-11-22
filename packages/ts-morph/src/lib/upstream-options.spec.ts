import {
  IsNormalizedBaseRequestMapper,
  IsNormalizedOpenApiUpstreamOptions,
  IsNormalizedOptionsRequestMapper,
  IsNormalizedPagedRequestMapper,
  IsNormalizedResolveRequestMapper,
  NormalizeBaseUpstreamOptions,
  NormalizeOpenApiUpstreamOptions,
  NormalizeOptionsRequestMapper,
  NormalizePagedRequestMapper,
  NormalizeRequestMapper,
  NormalizeResolveRequestMapper,
  NormalizeUpstreamOptions,
  RequestMapperKinds,
  ToOptionsFunction,
  UpstreamOptionsKinds,
} from './upstream-options';

describe('upstream-options', () => {
  it('NormalizeRequestMapper returns null for empty input', () => {
    expect(NormalizeRequestMapper()).toBeNull();
    expect(NormalizeRequestMapper(null)).toBeNull();
    expect(NormalizeRequestMapper({} as any)).toBeNull();
  });

  it('NormalizeRequestMapper dispatches on kind', () => {
    const base = NormalizeRequestMapper({ kind: RequestMapperKinds.DEFAULT })!;
    expect(IsNormalizedBaseRequestMapper(base)).toBe(true);
    expect(IsNormalizedPagedRequestMapper(base)).toBe(false);
    const paged = NormalizeRequestMapper({ kind: RequestMapperKinds.PAGED })!;
    expect(IsNormalizedPagedRequestMapper(paged)).toBe(true);
    const options = NormalizeRequestMapper({ kind: RequestMapperKinds.OPTIONS })!;
    expect(IsNormalizedOptionsRequestMapper(options)).toBe(true);
    const resolve = NormalizeRequestMapper({ kind: RequestMapperKinds.Resolve })!;
    expect(IsNormalizedResolveRequestMapper(resolve)).toBe(true);
    const unknown = NormalizeRequestMapper({ kind: 'other' as any })!;
    expect(IsNormalizedBaseRequestMapper(unknown)).toBe(true);
  });

  it('NormalizePagedRequestMapper fills nulls and filter', () => {
    expect(NormalizePagedRequestMapper({ kind: RequestMapperKinds.PAGED })).toEqual({
      kind: 'paged', pageIndex: null, pageSize: null, sortBy: null, list: null, total: null, sortDirection: null, filter: null,
    });
    const r = NormalizePagedRequestMapper({
      kind: RequestMapperKinds.PAGED, pageIndex: 'i', pageSize: 's', sortBy: 'b', list: 'l', total: 't', sortDirection: 'd',
      filter: { eq: 'a', join: 'b' },
    });
    expect(r.pageIndex).toBe('i');
    expect(r.filter).toEqual({ eq: 'a', join: 'b' });
    expect(Object.isFrozen(r)).toBe(true);
  });

  it('NormalizeOptionsRequestMapper defaults', () => {
    expect(NormalizeOptionsRequestMapper({ kind: RequestMapperKinds.OPTIONS })).toEqual({
      kind: 'options', toFunction: ToOptionsFunction.TO_OPTIONS, toValue: null, toDisplay: null,
    });
    expect(NormalizeOptionsRequestMapper({
      kind: RequestMapperKinds.OPTIONS, toFunction: ToOptionsFunction.TO_OPTIONS_FROM_OBJECT, toValue: 'v', toDisplay: 'd',
    }).toFunction).toBe('ToOptionsFromObject');
  });

  it('NormalizeResolveRequestMapper', () => {
    expect(NormalizeResolveRequestMapper({ kind: RequestMapperKinds.Resolve }).value).toBeNull();
    expect(NormalizeResolveRequestMapper({ kind: RequestMapperKinds.Resolve, value: 'x' }).value).toBe('x');
  });

  it('NormalizeBaseUpstreamOptions', () => {
    expect(NormalizeBaseUpstreamOptions({ kind: UpstreamOptionsKinds.OPEN_API })).toEqual({ kind: 'open-api', mapper: null });
  });

  it('NormalizeOpenApiUpstreamOptions', () => {
    const r = NormalizeOpenApiUpstreamOptions({ kind: UpstreamOptionsKinds.OPEN_API, operationId: 'op', mapper: { kind: RequestMapperKinds.Resolve, value: 'v' } as any });
    expect(r.operationId).toBe('op');
    expect(r.scope).toBeNull();
    expect(r.isService).toBe(false);
    expect((r.mapper as any).value).toBe('v');
    expect(IsNormalizedOpenApiUpstreamOptions(r)).toBe(true);
    expect(NormalizeOpenApiUpstreamOptions({ kind: UpstreamOptionsKinds.OPEN_API, operationId: 'op', scope: 's', isService: true })).toMatchObject({ scope: 's', isService: true });
  });

  it('NormalizeUpstreamOptions', () => {
    expect(NormalizeUpstreamOptions()).toBeNull();
    expect(NormalizeUpstreamOptions({} as any)).toBeNull();
    expect(NormalizeUpstreamOptions({ kind: UpstreamOptionsKinds.OPEN_API, operationId: 'o' } as any)).toMatchObject({ operationId: 'o' });
    expect(NormalizeUpstreamOptions({ kind: 'x' } as any)).toBeUndefined();
  });
});
