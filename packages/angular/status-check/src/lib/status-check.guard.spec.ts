import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';
import { of } from 'rxjs';
import { StatusCheckGuard } from './status-check.guard';
import { StatusCheckService } from './status-check.service';

describe('StatusCheckGuard', () => {
  const service = { getStatus: vi.fn() };
  const router = { createUrlTree: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => undefined);
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    TestBed.configureTestingModule({
      providers: [
        { provide: StatusCheckService, useValue: service },
        { provide: Router, useValue: router },
      ],
    });
  });

  afterEach(() => vi.restoreAllMocks());

  const run = (data: any) =>
    TestBed.runInInjectionContext(() =>
      StatusCheckGuard({ data, url: [{ toString: () => 'x' }, { toString: () => 'y' }] } as unknown as ActivatedRouteSnapshot),
    );

  it('allows when no status check configured', async () => {
    expect(await run({})).toBe(true);
    expect(await run({ statusCheck: { services: [] } })).toBe(true);
    expect(service.getStatus).not.toHaveBeenCalled();
  });

  it('allows when the status is ok', async () => {
    service.getStatus.mockReturnValue(of({ status: 'loading' }, { status: 'ok' }));
    expect(await run({ statusCheck: { services: ['a'] } })).toBe(true);
    expect(service.getStatus).toHaveBeenCalledWith(['a']);
  });

  it('redirects to the status-check page otherwise', async () => {
    const tree = {} as UrlTree;
    router.createUrlTree.mockReturnValue(tree);
    service.getStatus.mockReturnValue(of({ status: 'loading' }, { status: 'error' }));
    expect(await run({ statusCheck: { services: ['a', 'b'] } })).toBe(tree);
    expect(router.createUrlTree).toHaveBeenCalledWith(['/', 'status-check'], {
      queryParams: { url: '/x/y', service: ['a', 'b'] },
    });
  });
});
