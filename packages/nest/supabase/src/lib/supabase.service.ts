import {
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { GenericSchema } from '@supabase/supabase-js/dist/main/lib/types';
import { SupabaseModuleOptions } from './supabase.module';
import { SUPABASE_OPTIONS } from './tokens';

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
