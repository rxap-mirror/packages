import { Method } from '@rxap/utilities/rxjs';

export interface TableRowActionMethod<Data extends Record<string, any>>
  extends Method<any, { element: Data; type: string }> {}
