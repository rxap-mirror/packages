import { ToggleSubject } from '@rxap/rxjs';

export interface TableRowMetadata {
  __metadata__: {
    loading$: ToggleSubject;
  };
}
