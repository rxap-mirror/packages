import { Tree } from '@nx/devkit';
import { GetProjectRoot } from '@rxap/workspace-utilities';
import { join } from 'path';

export function cleanup(tree: Tree, projectName: string) {

  const projectRoot = GetProjectRoot(tree, projectName);

  const commandsFile = join(projectRoot, 'cypress/support/commands.ts');
  if (tree.exists(commandsFile)) {
    let content = tree.read(commandsFile, 'utf-8');
    content = content.replace('login(email: string, password: string): void;', '');
    content = content.replace('Cypress.Commands.add(\'login\', (email, password) => {', '// Cypress.Commands.add(\'login\', (email, password) => {');
    content = content.replace('  console.log(\'Custom command example: Login\', email, password);', '//   console.log(\'Custom command example: Login\', email, password);');
    content = content.replace('});', '// });');
    content = content.replace('// eslint-disable-next-line @typescript-eslint/no-unused-vars', '// eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-interface');
    tree.write(commandsFile, content);
  }

}
