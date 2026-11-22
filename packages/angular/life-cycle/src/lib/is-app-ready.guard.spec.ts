import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY, firstValueFrom, of } from 'rxjs';
import { IsAppReadyGuard } from './is-app-ready.guard';
import { LifeCycleService } from './life-cycle.service';

describe('IsAppReadyGuard', () => {
  it('emits true once the life cycle is ready', async () => {
    jest.spyOn(console, 'debug').mockImplementation();
    jest.spyOn(console, 'log').mockImplementation();
    TestBed.configureTestingModule({
      providers: [ { provide: ApplicationRef, useValue: { isStable: of(true), afterTick: EMPTY } } ],
    });
    const lifeCycle = TestBed.inject(LifeCycleService);
    const guard = TestBed.inject(IsAppReadyGuard);
    const result = await firstValueFrom(guard.canActivate({} as any, { url: '/x' } as any));
    expect(result).toBe(true);
    expect(lifeCycle.isReady$.value).toBe(true);
  });
});
