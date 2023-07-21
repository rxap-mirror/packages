import { FormControlOptions } from '../../form-control/schema';

export interface SelectFormControlOptions extends FormControlOptions {
  multiple?: boolean;
  staticDataSource?: boolean;
}
