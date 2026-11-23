import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RXAP_ENVIRONMENT } from '@rxap/environment';
import {
  ChangelogService,
  RXAP_CHANGELOG_DISABLED,
  RXAP_CHANGELOG_LAST_VERSION,
} from './changelog.service';
import { ChangelogDialogComponent } from './changelog-dialog/changelog-dialog.component';
import { ProvideChangelog } from './provide-changelog';

describe('ChangelogService', () => {
  function setup(name: string | undefined = '1.0.0') {
    TestBed.configureTestingModule({
      providers: [{ provide: RXAP_ENVIRONMENT, useValue: { name } }],
    });
    return TestBed.inject(ChangelogService);
  }

  beforeEach(() => localStorage.clear());

  it('reads and writes the last version', () => {
    const service = setup();
    expect(service.lastVersion).toBeNull();
    service.lastVersion = '2.0.0';
    expect(localStorage.getItem(RXAP_CHANGELOG_LAST_VERSION)).toBe('2.0.0');
    expect(service.lastVersion).toBe('2.0.0');
    service.lastVersion = null;
    expect(localStorage.getItem(RXAP_CHANGELOG_LAST_VERSION)).toBeNull();
  });

  it('reports disabled flag', () => {
    const service = setup();
    expect(service.isDisabled).toBe(false);
    localStorage.setItem(RXAP_CHANGELOG_DISABLED, 'true');
    expect(service.isDisabled).toBe(true);
  });

  describe('showChangelogDialogIfNewVersion', () => {
    it('does nothing when disabled', () => {
      const service = setup();
      const spy = vi.spyOn(service, 'showChangelogDialog').mockImplementation(() => undefined);
      localStorage.setItem(RXAP_CHANGELOG_DISABLED, 'true');
      service.showChangelogDialogIfNewVersion();
      expect(spy).not.toHaveBeenCalled();
    });

    it('does nothing when version already seen', () => {
      const service = setup('1.0.0');
      const spy = vi.spyOn(service, 'showChangelogDialog').mockImplementation(() => undefined);
      service.lastVersion = '1.0.0';
      service.showChangelogDialogIfNewVersion();
      expect(spy).not.toHaveBeenCalled();
    });

    it('shows when no last version exists', () => {
      const service = setup('1.0.0');
      const spy = vi.spyOn(service, 'showChangelogDialog').mockImplementation(() => undefined);
      service.showChangelogDialogIfNewVersion();
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('resets last version and shows when version changed', () => {
      const service = setup('2.0.0');
      const spy = vi.spyOn(service, 'showChangelogDialog').mockImplementation(() => undefined);
      service.lastVersion = '1.0.0';
      service.showChangelogDialogIfNewVersion();
      expect(service.lastVersion).toBeNull();
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });

  describe('showChangelogDialog', () => {
    beforeEach(() => {
      (HTMLDialogElement.prototype as any).showModal = vi.fn();
      (HTMLDialogElement.prototype as any).close = vi.fn();
      TestBed.overrideComponent(ChangelogDialogComponent, {
        set: { template: '<dialog #dialog></dialog>', imports: [] },
      });
    });

    function open(service: ChangelogService) {
      const before = document.body.children.length;
      service.showChangelogDialog();
      expect(document.body.children.length).toBe(before + 1);
      const host = document.body.lastElementChild as Element;
      const instance: ChangelogDialogComponent = (globalThis as any).ng.getComponent(host);
      return { host, instance };
    }

    it('mounts the dialog and removes it after close, remembering the version', () => {
      const service = setup('3.0.0');
      const { host, instance } = open(service);
      TestBed.inject(ApplicationRef).tick();
      instance.close(true);
      expect(service.lastVersion).toBe('3.0.0');
    });

    it('does not remember the version when unchecked', () => {
      const service = setup('3.0.0');
      const { instance } = open(service);
      TestBed.inject(ApplicationRef).tick();
      instance.close(false);
      expect(service.lastVersion).toBeNull();
    });
  });

  it('ProvideChangelog returns an environment provider', () => {
    expect(ProvideChangelog()).toBeDefined();
  });

  it('ProvideChangelog initializer triggers the version check', () => {
    localStorage.clear();
    (HTMLDialogElement.prototype as any).showModal = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: RXAP_ENVIRONMENT, useValue: { name: '1' } },
        ProvideChangelog(),
      ],
    });
    TestBed.overrideComponent(ChangelogDialogComponent, {
      set: { template: '<dialog #dialog></dialog>', imports: [] },
    });
    TestBed.inject(ApplicationRef);
    expect(HTMLDialogElement.prototype.showModal).toBeDefined();
  });
});
