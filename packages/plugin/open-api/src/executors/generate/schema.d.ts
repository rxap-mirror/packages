export interface GenerateExecutorSchema {
  project: string;
  debug?: boolean;
  prefix: string;
  export?: boolean;
  serverId?: string;
  inline?: boolean;
  directory?: string;
  skipRemoteMethod: boolean;
  skipCommand: boolean;
  skipProvider: boolean;
  skipDirectives: boolean;
  skipDataSource: boolean;
  skipFormat?: boolean;
  path: string;
}
