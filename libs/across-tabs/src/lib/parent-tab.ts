import AcrossTabs, {
  Parent,
  ParentTabConfig,
  OpenNewTabConfig
} from 'across-tabs';
import { Subject } from 'rxjs';

export interface TabHandshake {
  id: string;
}

export interface ChildTabMeta {
  id: string;
  ref: Window;
  status: 'open' | 'close';
  url: string;
}

export class ParentTab {

  public readonly onHandshake$          = new Subject<TabHandshake>();
  public readonly onChildCommunication$ = new Subject<string>();
  public readonly onPolling$            = new Subject<void>();

  private _parent: Parent;

  constructor(config: ParentTabConfig = {}) {
    this._parent = new AcrossTabs.Parent({
      ...config,
      onHandshakeCallback:  (value: TabHandshake) => this.onHandshake$.next(value),
      onChildCommunication: (value: string) => this.onChildCommunication$.next(value),
      onPollingCallback:    () => this.onPolling$.next()
    });
  }

  public openNewTab(config: OpenNewTabConfig): void {
    return this._parent.openNewTab(config);
  }

  public getAllTabs(): ChildTabMeta[] {
    return this._parent.getAllTabs();
  }

  public getOpenedTabs(): ChildTabMeta[] {
    return this._parent.getOpenedTabs();
  }

  public getClosedTabs(): ChildTabMeta[] {
    return this._parent.getClosedTabs();
  }

  public closeAllTabs(): void {
    return this._parent.closeAllTabs();
  }

  public closeTab(id: string): void {
    return this._parent.closeTab(id);
  }

  public broadCastAll(message: string): void {
    return this._parent.broadCastAll(message);
  }

  public broadCastTo(id: string, message: string) {
    return this._parent.broadCastTo(id, message);
  }

}
