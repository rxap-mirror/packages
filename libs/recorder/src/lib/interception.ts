export interface Interception<T = any> {
  data?: T;
  destroyed?: boolean;
  definitionId: string;
  instanceId: string;
  childTabId: string;
  packageName: string;
  className: string;
  timestamp: number;
}
