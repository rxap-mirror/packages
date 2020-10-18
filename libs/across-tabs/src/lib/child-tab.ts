import AcrossTabs, {
  ChildTabConfig,
  Child
} from 'across-tabs';
import { Subject } from 'rxjs';

export class ChildTab {

  public readonly onReady$               = new Subject();
  public readonly onInitialize$          = new Subject();
  public readonly onParentDisconnect$    = new Subject();
  public readonly onParentCommunication$ = new Subject();

  private _child: Child;

  constructor(config: ChildTabConfig = {}) {
    this._child = new AcrossTabs.Child({
      ...config,
      onReady:               (value: any) => this.onReady$.next(value),
      onInitialize:          (value: any) => this.onInitialize$.next(value),
      onParentDisconnect:    (value: any) => this.onParentDisconnect$.next(value),
      onParentCommunication: (value: any) => this.onParentCommunication$.next(value)
    });
  }

  public getTabInfo(): { id: string, name: string, parentName: string } {
    return this._child.getTabInfo();
  }

  public sendMessageToParent(message: string): void {
    return this._child.sendMessageToParent(message);
  }

}
