export interface Method {
  call(parameters: { value: any; initial: any }): Promise<any> | any;
}
