import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { GenericSchema } from '@supabase/supabase-js/dist/main/lib/types';
import { SupabaseModuleOptions } from './supabase.module';
import { SUPABASE_OPTIONS } from './tokens';

/**
 * Represents a service for interacting with the Supabase database.
 * This service extends the SupabaseClient class.
 * @typeparam Database - The type of the Supabase database.
 * @typeparam SchemaName - The type of the schema name. It should be a string that is a keyof the Database type.
 * @typeparam Schema - The type of the schema. It should be either the value of the Database[SchemaName] or any.
 */
@Injectable()
export class SupabaseService<
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
                                               ? 'public'
                                               : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
                                 ? Database[SchemaName]
                                 : any
> extends SupabaseClient<Database, SchemaName, Schema> {

  constructor(
    @Inject(SUPABASE_OPTIONS)
      {
        supabaseKey,
        supabaseUrl,
        options,
      }: SupabaseModuleOptions<Database, SchemaName>,
    logger: Logger,
  ) {
    super(supabaseUrl, supabaseKey, options);
    logger.log('Initialized supabase client', 'SupabaseService');
  }

}
