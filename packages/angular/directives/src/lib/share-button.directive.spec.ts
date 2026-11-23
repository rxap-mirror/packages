import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ShareButtonDirective, ShareService } from './share-button.directive';

@Component({
  standalone: true,
  imports: [ ShareButtonDirective ],
  template: `
    <button
      rxapShareButton
      [url]="url()"
      [text]="text()"
      [title]="title()"
      (success)="success()"
      (failed)="failed($event)"
    ></button>
  `,
})
class HostComponent {
  public readonly url = signal('https://rxap.dev');
  public readonly text = signal('text');
  public readonly title = signal('title');
  public readonly success = vi.fn();
  public readonly failed = vi.fn();
}

describe('@rxap/directives', () => {
  describe('ShareService', () => {
    afterEach(() => vi.unstubAllGlobals());

    function createService(nav: Partial<Navigator>) {
      vi.stubGlobal('navigator', nav);
      return TestBed.runInInjectionContext(() => new ShareService());
    }

    it('should not be supported without the web share api', () => {
      expect(createService({}).isSupported).toBe(false);
    });

    it('should be supported with share and canShare', () => {
      expect(createService({ share: vi.fn(), canShare: vi.fn() }).isSupported).toBe(true);
    });

    it('should share the data when it can be shared', async () => {
      const share = vi.fn().mockResolvedValue(undefined);
      const service = createService({ share, canShare: vi.fn().mockReturnValue(true) });
      await service.share({ url: 'https://rxap.dev' });
      expect(share).toHaveBeenCalledWith({ url: 'https://rxap.dev' });
    });

    it('should throw when the data can not be shared', async () => {
      vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const share = vi.fn();
      const service = createService({ share, canShare: vi.fn().mockReturnValue(false) });
      await expect(service.share({ text: 'x' })).rejects.toThrow('Can not share data');
      expect(share).not.toHaveBeenCalled();
    });

    it('should only warn when sharing is not supported and softFail is set', async () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
      const alertSpy = vi.fn();
      vi.stubGlobal('alert', alertSpy);
      await createService({}).share({ text: 'x' });
      expect(warn).toHaveBeenCalledWith('Native share is not supported!');
      expect(alertSpy).not.toHaveBeenCalled();
    });

    it('should alert when sharing is not supported and softFail is disabled', async () => {
      const alertSpy = vi.fn();
      vi.stubGlobal('alert', alertSpy);
      await createService({}).share({ text: 'x' }, false);
      expect(alertSpy).toHaveBeenCalledWith('Native share is not supported!');
    });
  });

  describe('ShareButtonDirective', () => {
    function setup(shareImpl: () => Promise<void>) {
      const share = vi.fn(shareImpl);
      TestBed.configureTestingModule({ providers: [ { provide: ShareService, useValue: { share } } ] });
      const fixture = TestBed.createComponent(HostComponent);
      fixture.detectChanges();
      const button = fixture.debugElement.query(By.directive(ShareButtonDirective));
      return { fixture, host: fixture.componentInstance, button, share };
    }

    it('should share the bound data on click and emit success', async () => {
      const { host, button, share } = setup(() => Promise.resolve());
      button.nativeElement.click();
      await vi.waitFor(() => expect(host.success).toHaveBeenCalledTimes(1));
      expect(share).toHaveBeenCalledWith({
        url: 'https://rxap.dev',
        text: 'text',
        title: 'title',
        files: undefined,
      });
      expect(host.failed).not.toHaveBeenCalled();
    });

    it('should emit failed when sharing fails', async () => {
      const error = new Error('denied');
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
      const { host, button } = setup(() => Promise.reject(error));
      button.nativeElement.click();
      await vi.waitFor(() => expect(host.failed).toHaveBeenCalledWith(error));
      expect(host.success).not.toHaveBeenCalled();
      expect(consoleError).toHaveBeenCalledWith('share failed: denied');
    });
  });
});
