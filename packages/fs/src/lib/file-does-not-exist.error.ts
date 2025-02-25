export class FileDoesNotExistError extends Error {

  constructor(fileName: string) {
    super(`File '${ fileName }' does not exist`);
    this.name = 'FileDoesNotExistError';
  }

}
