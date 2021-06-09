import { FormDefinition } from "@rxap/forms";
import { WindowRef } from "@rxap/window-system";
import { Inject } from "@angular/core";

/**
 * @deprecated removed
 */
export class FormWindowRef<Data = any> {
  constructor(
    public readonly formDefinition: FormDefinition,
    @Inject(WindowRef)
    public readonly windowRef: WindowRef
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
