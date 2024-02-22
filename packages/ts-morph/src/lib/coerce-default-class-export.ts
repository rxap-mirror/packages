import {
  ClassDeclaration,
  SourceFile,
} from 'ts-morph';

export function CoerceDefaultClassExport(sourceFileOrClassDeclaration: SourceFile | ClassDeclaration, standalone = false) {

  const classDeclaration = sourceFileOrClassDeclaration instanceof SourceFile ? sourceFileOrClassDeclaration.getClasses().filter(cd => !cd.isDefaultExport())[0] : sourceFileOrClassDeclaration;
  const sourceFile = sourceFileOrClassDeclaration instanceof SourceFile ? sourceFileOrClassDeclaration : sourceFileOrClassDeclaration.getSourceFile();

  if (!ClassDeclaration) {
    throw new Error('No class declaration');
  }

  if (standalone) {
    console.log('standalone', sourceFile.getExportAssignments().map(ed => ed.getExpression().getText()));
    if (!sourceFile.getExportAssignments().some(ed => ed.getExpression().getText() === classDeclaration.getName())) {
      sourceFile.addExportAssignment({
        isExportEquals: false,
        expression: classDeclaration.getName()!,
      });
    }
  } else {
    if (!sourceFile.getClasses().some(cd => cd.isDefaultExport() && cd.getName() === classDeclaration.getName())) {
      classDeclaration.setIsDefaultExport(true);
    }
  }

}
