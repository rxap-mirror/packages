import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseModuleOptions } from './supabase.module';
import { SUPABASE_OPTIONS } from './tokens';

/**
 * Represents a service for interacting with the Supabase database.
 * This service extends the SupabaseClient class.
 * @typeparam Database - The type of the Supabase database.
 * @typeparam SchemaName - The type of the schema name. It should be a string that is a keyof the Database type
 * (the internal `__InternalSupabase` marker key is excluded).
 */
@Injectable()
export class SupabaseService<
  Database = any,
  SchemaName extends string & keyof Omit<Database, '__InternalSupabase'> = 'public' extends keyof Omit<Database, '__InternalSupabase'>
                                                                           ? 'public'
                                                                           : string & keyof Omit<Database, '__InternalSupabase'>,
> extends SupabaseClient<Database, SchemaName> {

  constructor(
    @Inject(SUPABASE_OPTIONS)
      {
        supabaseKey,
        supabaseUrl,
        options,
      }: SupabaseModuleOptions<Database, SchemaName>,
    logger: Logger,
  ) {
    // supabase-js >= 2.4x resolves the schema name through a conditional type that TypeScript cannot
    // evaluate for a generic SchemaName; the options are structurally identical at runtime.
    super(supabaseUrl, supabaseKey, options as any);
    logger.log('Initialized supabase client', 'SupabaseService');
  }

}
