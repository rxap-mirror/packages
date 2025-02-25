export class FolderDoesNotExistError extends Error {

  constructor(folderName: string) {
    super(`Folder '${ folderName }' does not exist`);
    this.name = 'FolderDoesNotExistError';
  }

}
