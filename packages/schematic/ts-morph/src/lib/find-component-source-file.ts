import {
  Project,
  SourceFile,
} from 'ts-morph';
import {
  classify,
  CoerceSuffix,
} from '@rxap/schematics-utilities';

export function FindComponentSourceFile(name: string, project: Project): SourceFile {
  const className = CoerceSuffix(classify(name), 'Component');
  try {
    return project.getSourceFileOrThrow(sourceFile => !!sourceFile.getClass(className));
  } catch (e: any) {

    console.debug(`Could not find class '${ className }' in any of this files.`, project
      .getSourceFiles()
      .map(sourceFile => sourceFile.getFilePath())
      .filter(filePath => filePath.match(/\.component\.ts/)),
    );

    throw e;
  }
}
