import { SourceFile } from 'ts-morph';

export function skipSourceFile(sourceFile: SourceFile, filter?: string) {
  if (sourceFile.getBaseName() === 'index.ts') {
    // console.log(`\x1b[33mSkip index file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (sourceFile.getBaseName().endsWith('.spec.ts')) {
    // console.log(`\x1b[33mSkip spec file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (sourceFile.getBaseName().endsWith('.stories.ts')) {
    // console.log(`\x1b[33mSkip stories file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (sourceFile.getBaseName().endsWith('.cy.ts')) {
    // console.log(`\x1b[33mSkip cypress file: \x1b[0m${ sourceFile.getFilePath() }`);
    return true;
  }
  if (filter) {
    if (!sourceFile.getFilePath().includes(filter)) {
      // console.log(`\x1b[33mSkip file: \x1b[0m${ sourceFile.getFilePath() }`);
      return true;
    }
  }
  return false;
}
