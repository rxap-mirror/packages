import { SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { SantizationPipe } from './santization.pipe';
import { SantizationService } from './santization.service';

describe('@rxap/pipes/santization', () => {

  describe('SantizationService', () => {
    let service: SantizationService;
    let sanitizer: DomSanitizer;

    beforeEach(() => {
      service = TestBed.inject(SantizationService);
      sanitizer = TestBed.inject(DomSanitizer);
    });

    it('should return null for a null value without bypassing the security', () => {
      const bypass = vi.spyOn(sanitizer, 'bypassSecurityTrustUrl');
      expect(service.transform(null)).toBeNull();
      expect(service.transform(null, 'html')).toBeNull();
      expect(bypass).not.toHaveBeenCalled();
    });

    it.each([
      [ 'html', SecurityContext.HTML, '<b>bold</b><script>alert(1)</script>' ],
      [ 'style', SecurityContext.STYLE, 'color: red' ],
      [ 'script', SecurityContext.SCRIPT, 'alert(1)' ],
      [ 'url', SecurityContext.URL, 'javascript:alert(1)' ],
      [ 'resourceUrl', SecurityContext.RESOURCE_URL, 'https://rxap.dev/resource' ],
    ] as const)('should trust the value as %s', (type, context, value) => {
      const safe = service.transform(value, type);
      expect(safe).not.toBe(value);
      // a trusted value is unwrapped by the sanitizer for exactly its own context
      expect(sanitizer.sanitize(context, safe)).toBe(value);
    });

    it('should default to the url type', () => {
      const value = 'javascript:alert(1)';
      expect(TestBed.inject(DomSanitizer).sanitize(SecurityContext.URL, service.transform(value))).toBe(value);
    });

    it('should throw for an unsupported type', () => {
      expect(() => service.transform('x', 'unknown' as any)).toThrow('type is not set');
    });
  });

  describe('SantizationPipe', () => {
    it('should delegate to the service', () => {
      const service = TestBed.inject(SantizationService);
      const spy = vi.spyOn(service, 'transform');
      const pipe = TestBed.runInInjectionContext(() => new SantizationPipe());
      const result = pipe.transform('<i>x</i>', 'html');
      expect(spy).toHaveBeenCalledWith('<i>x</i>', 'html');
      expect(result).toBe(spy.mock.results[0].value);
    });

    it('should default to the url type', () => {
      const service = TestBed.inject(SantizationService);
      const spy = vi.spyOn(service, 'transform');
      const pipe = TestBed.runInInjectionContext(() => new SantizationPipe());
      pipe.transform('https://rxap.dev');
      expect(spy).toHaveBeenCalledWith('https://rxap.dev', 'url');
    });
  });

});
