declare module 'across-tabs' {

  export interface ParentTabConfig {
    heartBeatInterval?: number;
    removeClosedTabs?: boolean;
    shouldInitImmediately?: boolean;
    onHandshakeCallback?: Function;
    onChildCommunication?: Function;
    onPollingCallback?: Function;
    origin?: string;
    parse?: (value: string) => object;
    stringify?: (obj: object) => string;
  }

  export interface OpenNewTabConfig {
    url: string;
    windowName?: string;
  }

  export class Parent {

    constructor(config: ParentTabConfig) {}

    public openNewTab(config: OpenNewTabConfig): void;

    public getAllTabs(): any[];

    public getOpenedTabs(): any[];

    public getClosedTabs(): any[];

    public closeAllTabs(): void;

    public closeTab(id: string): void;

    public broadCastAll(message: string): void;

    public broadCastTo(id: string, message: string);

  }

  export interface ChildTabConfig {
    handshakeExpiryLimit?: number;
    isSiteInsideFrame?: boolean | null;
    onReady?: Function;
    onInitialize?: Function;
    onParentDisconnect?: Function;
    onParentCommunication?: Function;
    origin?: string;
    parse?: (value: string) => object;
    stringify?: (obj: object) => string;
  }

  export class Child {

    constructor(config: ChildTabConfig) {}

    public getTabInfo(): { id: string, name: string, parentName: string };

    public sendMessageToParent(message: string): void;

  }

  const AcrossTabs = {
    Parent,
    Child
  };

  export default AcrossTabs;

}
