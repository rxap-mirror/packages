import { ToggleSubject } from '@rxap/utilities/rxjs';

export interface TableRowMetadata {
  __metadata__: {
    loading$: ToggleSubject;
  };
}
