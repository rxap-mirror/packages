import { TestBed } from '@angular/core/testing';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import { ChangelogControllerGetVersionRemoteMethod } from '../openapi/remote-methods/changelog-controller-get-version.remote-method';
import { ChangelogControllerListRemoteMethod } from '../openapi/remote-methods/changelog-controller-list.remote-method';
import { ChangelogComponent } from './changelog.component';

describe('ChangelogComponent', () => {
  const list = { call: jest.fn() };
  const get = { call: jest.fn() };

  async function create(versions: string[] | Error) {
    list.call.mockReset();
    get.call.mockReset();
    get.call.mockResolvedValue({ general: ['# g'], application: ['# a'] });
    if (versions instanceof Error) {
      list.call.mockRejectedValue(versions);
    } else {
      list.call.mockResolvedValue(versions);
    }
    TestBed.configureTestingModule({
      imports: [ChangelogComponent],
      providers: [
        { provide: RXAP_ENVIRONMENT, useValue: { app: 'my-app' } },
        { provide: ChangelogControllerListRemoteMethod, useValue: list },
        { provide: ChangelogControllerGetVersionRemoteMethod, useValue: get },
      ],
    });
    TestBed.overrideComponent(ChangelogComponent, {
      set: { imports: [], template: '' },
    });
    const fixture = TestBed.createComponent(ChangelogComponent);
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('loads versions and selects the last one', async () => {
    const c = await create(['1', '2', '3']);
    expect(c.availableVersions()).toEqual(['1', '2', '3']);
    expect(c.activeIndex()).toBe(2);
    expect(c.selectedVersion()).toBe('3');
    expect(c.getChangelogMethodParameters()).toEqual({
      parameters: { version: '3', application: 'my-app' },
    });
  });

  it('falls back to latest without versions', async () => {
    const c = await create([]);
    expect(c.selectedVersion()).toBe('latest');
    expect(c.displayedButtons()).toEqual([]);
  });

  it('uses the last version when index is -1', async () => {
    const c = await create(['1', '2']);
    c.activeIndex.set(-1);
    expect(c.selectedVersion()).toBe('2');
    c.activeIndex.set(10);
    expect(c.selectedVersion()).toBe('latest');
  });

  it('shows a window of five buttons around the active index', async () => {
    const c = await create(['1', '2', '3', '4', '5', '6', '7', '8']);
    c.activeIndex.set(4);
    expect(c.displayedButtons().map((b) => b.version)).toEqual(['3', '4', '5', '6', '7']);
    c.activeIndex.set(0);
    expect(c.displayedButtons().map((b) => b.index)).toEqual([0, 1, 2, 3, 4]);
    c.activeIndex.set(7);
    expect(c.displayedButtons().map((b) => b.index)).toEqual([3, 4, 5, 6, 7]);
  });

  it('shows fewer buttons for short lists', async () => {
    const c = await create(['1', '2']);
    expect(c.displayedButtons().length).toBe(2);
  });

  it('stores the error message on failure', async () => {
    const c = await create(new Error('boom'));
    expect(c.error()).toBe('boom');
  });
});
