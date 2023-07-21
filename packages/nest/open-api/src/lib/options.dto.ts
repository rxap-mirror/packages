import { Expose } from 'class-transformer';
import {
  IsString,
  ValidateNested,
} from 'class-validator';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export class OptionsDto<Key, Value> {

  @Expose()
  @IsString()
  display!: Key;

  @Expose()
  @ValidateNested()
  value!: Value;

}

export function OptionsDtoSchemaFactory(valueSchema: SchemaObject = {}): SchemaObject {
  return {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        value: valueSchema,
        display: {
          type: 'string',
        },
      },
      required: [ 'value', 'display' ],
    },
  };
}

export const OptionsDtoSchema = OptionsDtoSchemaFactory();
