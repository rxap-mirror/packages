import { TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { IconLoaderService } from './icon-loader.service';
import {
  LoadIconSetsFactory,
  ProvideIconAssetPath,
} from './provide-icon-asset-path';
import {
  DefaultIconSvgFilePath,
  RXAP_ICON_ASSET_PATH,
} from './tokens';

describe('icon', () => {
  let debugSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  const registry = { addSvgIconSet: jest.fn() };

  beforeEach(() => {
    registry.addSvgIconSet.mockReset();
    debugSpy = jest.spyOn(console, 'debug').mockImplementation();
    errorSpy = jest.spyOn(console, 'error').mockImplementation();
  });
  afterEach(() => {
    debugSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('default token resolves to mdi.svg', () => {
    expect(DefaultIconSvgFilePath()).toBe('mdi.svg');
    expect(TestBed.inject(RXAP_ICON_ASSET_PATH)).toBe('mdi.svg');
  });

  describe('LoadIconSetsFactory', () => {
    const sanitizer = { bypassSecurityTrustResourceUrl: (p: string) => `trusted:${ p }` } as any as DomSanitizer;

    it('registers a single path', () => {
      LoadIconSetsFactory(registry as any, sanitizer, 'a.svg')();
      expect(registry.addSvgIconSet).toHaveBeenCalledWith('trusted:a.svg');
    });

    it('registers every path in a list', () => {
      LoadIconSetsFactory(registry as any, sanitizer, [ 'a.svg', 'b.svg' ])();
      expect(registry.addSvgIconSet).toHaveBeenCalledTimes(2);
    });

    it('logs errors and continues', () => {
      registry.addSvgIconSet.mockImplementationOnce(() => {
        throw new Error('boom');
      });
      LoadIconSetsFactory(registry as any, sanitizer, [ 'a.svg', 'b.svg' ])();
      expect(errorSpy).toHaveBeenCalledWith('Could not load icon set from path a.svg', 'boom');
      expect(registry.addSvgIconSet).toHaveBeenCalledTimes(2);
    });
  });

  describe('ProvideIconAssetPath', () => {
    it('registers default icon sets on init', () => {
      TestBed.configureTestingModule({
        providers: [
          { provide: MatIconRegistry, useValue: registry },
          ProvideIconAssetPath(),
        ],
      });
      TestBed.inject(RXAP_ICON_ASSET_PATH);
      expect(TestBed.inject(RXAP_ICON_ASSET_PATH)).toEqual([ 'mdi.svg', 'custom.svg' ]);
      expect(registry.addSvgIconSet).toHaveBeenCalledTimes(2);
    });

    it('uses custom paths', () => {
      TestBed.configureTestingModule({
        providers: [
          { provide: MatIconRegistry, useValue: registry },
          ProvideIconAssetPath([ 'x.svg' ]),
        ],
      });
      TestBed.inject(RXAP_ICON_ASSET_PATH);
      expect(registry.addSvgIconSet).toHaveBeenCalledTimes(1);
    });
  });

  describe('IconLoaderService', () => {
    it('loads configured paths', () => {
      TestBed.configureTestingModule({
        providers: [
          { provide: MatIconRegistry, useValue: registry },
          { provide: RXAP_ICON_ASSET_PATH, useValue: [ 'a.svg', 'b.svg' ] },
        ],
      });
      TestBed.inject(IconLoaderService).load();
      expect(registry.addSvgIconSet).toHaveBeenCalledTimes(2);
    });

    it('logs errors', () => {
      registry.addSvgIconSet.mockImplementation(() => {
        throw new Error('bad');
      });
      TestBed.configureTestingModule({
        providers: [
          { provide: MatIconRegistry, useValue: registry },
          { provide: RXAP_ICON_ASSET_PATH, useValue: 'a.svg' },
        ],
      });
      TestBed.inject(IconLoaderService).load();
      expect(errorSpy).toHaveBeenCalledWith('Could not load icon set from path a.svg', 'bad');
    });
  });
});
