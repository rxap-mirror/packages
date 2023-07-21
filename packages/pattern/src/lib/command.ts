export interface Command<Response, Arguments> {
  execute(args?: Arguments): Promise<Response>;
}
