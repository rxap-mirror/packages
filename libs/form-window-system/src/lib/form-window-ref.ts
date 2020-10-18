import { FormDefinition } from '@rxap/forms';
import { WindowRef } from '@rxap/window-system';

export class FormWindowRef<Data = any> {

  constructor(
    public readonly formDefinition: FormDefinition,
    public readonly windowRef: WindowRef,
  ) {}

  public submit() {
    throw new Error('Not yet implemented!');
  }

  public reset() {
    throw new Error('Not yet implemented!');
  }

  public close(result?: any) {
    this.windowRef.close(result);
  }

}
