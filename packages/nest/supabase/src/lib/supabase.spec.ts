import { Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SupabaseModule, SupabaseOptionsFactory } from './supabase.module';
import { SupabaseModuleOptionsLoader } from './supabase-module-options-loader';
import { SupabaseService } from './supabase.service';
import { SUPABASE_OPTIONS } from './tokens';

describe('SupabaseOptionsFactory', () => {
  it('applies auth defaults', () => {
    const o = SupabaseOptionsFactory({ supabaseUrl: 'u', supabaseKey: 'k' });
    expect(o.options!.auth).toEqual({ autoRefreshToken: false, persistSession: false });
  });

  it('keeps explicit auth values', () => {
    const o = SupabaseOptionsFactory({
      supabaseUrl: 'u',
      supabaseKey: 'k',
      options: { auth: { autoRefreshToken: true } },
    });
    expect(o.options!.auth).toEqual({ autoRefreshToken: true, persistSession: false });
  });
});

describe('SupabaseModuleOptionsLoader', () => {
  it('reads url and key from config', () => {
    const loader = new SupabaseModuleOptionsLoader();
    const getOrThrow = jest.fn((k: string) => `v-${k}`);
    (loader as any).config = { getOrThrow };
    expect(loader.create()).toEqual({ supabaseUrl: 'v-SUPABASE_URL', supabaseKey: 'v-SUPABASE_KEY' });
  });

  it('propagates missing config errors', () => {
    const loader = new SupabaseModuleOptionsLoader();
    (loader as any).config = {
      getOrThrow: () => {
        throw new Error('missing');
      },
    };
    expect(() => loader.create()).toThrow('missing');
  });
});

describe('SupabaseModule', () => {
  it('register adds the options provider', () => {
    const m = SupabaseModule.register({ supabaseUrl: 'http://x', supabaseKey: 'k' });
    expect(m.providers!.some((p: any) => p.provide === SUPABASE_OPTIONS)).toBe(true);
  });

  it('registerAsync adds the options provider', () => {
    const m = SupabaseModule.registerAsync({ useFactory: () => ({ supabaseUrl: 'http://x', supabaseKey: 'k' }) });
    expect(m.providers!.some((p: any) => p.provide === SUPABASE_OPTIONS)).toBe(true);
  });

  it('provides a SupabaseService with the configured client', async () => {
    const logger = { log: jest.fn() };
    const ref = await Test.createTestingModule({
      imports: [SupabaseModule.register({ supabaseUrl: 'http://localhost:54321', supabaseKey: 'key' })],
    })
      .overrideProvider(Logger)
      .useValue(logger)
      .compile();
    const service = ref.get(SupabaseService);
    expect(service).toBeInstanceOf(SupabaseService);
    expect(typeof service.from).toBe('function');
    expect(logger.log).toHaveBeenCalledWith('Initialized supabase client', 'SupabaseService');
  });

  it('works with the options loader via registerAsync', async () => {
    const ref = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ SUPABASE_URL: 'http://localhost:54321', SUPABASE_KEY: 'k' })],
        }),
        SupabaseModule.registerAsync({ useClass: SupabaseModuleOptionsLoader }),
      ],
    })
      .overrideProvider(Logger)
      .useValue({ log: jest.fn() })
      .compile();
    expect(ref.get(SupabaseService)).toBeDefined();
    expect(ref.get(SUPABASE_OPTIONS).supabaseKey).toBe('k');
  });
});
