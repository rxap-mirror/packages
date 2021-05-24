import { BundleResult, FileRegistry, ImportData } from './interfaces';
import { EOL } from 'os';
import { access, readFile } from 'fs/promises';
import { resolve, dirname, basename, join } from 'path';
import * as globs from 'globs';

const IMPORT_PATTERN = /@import\s+['"](.+)['"];/g;
const COMMENT_PATTERN = /\/\/.*$/gm;
const MULTILINE_COMMENT_PATTERN = /\/\*[\s\S]*?\*\//g;
const DEFAULT_FILE_EXTENSION = '.scss';
const ALLOWED_FILE_EXTENSIONS = ['.scss', '.css'];
const NODE_MODULES = 'node_modules';
const TILDE = '~';

export class Bundler {
  // Full paths of used imports and their count
  private usedImports: { [key: string]: number } = {};
  // Imports dictionary by file
  private importsByFile: { [key: string]: BundleResult[] } = {};

  constructor(
    private fileRegistry: FileRegistry = {},
    private readonly projectDirectory?: string
  ) {}

  public async bundle(
    file: string,
    dedupeGlobs: string[] = [],
    includePaths: string[] = [],
    ignoredImports: string[] = []
  ): Promise<BundleResult> {
    try {
      if (this.projectDirectory != null) {
        file = resolve(this.projectDirectory, file);
      }

      await access(file);
      const contentPromise = readFile(file, 'utf-8');
      const dedupeFilesPromise = this.globFilesOrEmpty(dedupeGlobs);

      // Await all async operations and extract results
      const [content, dedupeFiles] = await Promise.all([
        contentPromise,
        dedupeFilesPromise,
      ]);

      // Convert string array into regular expressions
      const ignoredImportsRegEx = ignoredImports.map(
        (ignoredImport) => new RegExp(ignoredImport)
      );

      return this._bundle(
        file,
        content,
        dedupeFiles,
        includePaths,
        ignoredImportsRegEx
      );
    } catch {
      return {
        filePath: file,
        found: false,
      };
    }
  }

  private isExtensionExists(importName: string): boolean {
    return ALLOWED_FILE_EXTENSIONS.some(
      (extension) => importName.indexOf(extension) !== -1
    );
  }

  private async _bundle(
    filePath: string,
    content: string,
    dedupeFiles: string[],
    includePaths: string[],
    ignoredImports: RegExp[]
  ): Promise<BundleResult> {
    // Remove commented imports
    content = this.removeImportsFromComments(content);

    // Resolve path to work only with full paths
    filePath = resolve(filePath);

    const dirnamePath = dirname(filePath);

    if (this.fileRegistry[filePath] == null) {
      this.fileRegistry[filePath] = content;
    }

    // Resolve imports file names (prepend underscore for partials)
    const importsPromises = Array.from(content.matchAll(IMPORT_PATTERN)).map(
      async (match) => {
        let importName = match[1];
        // Append extension if it's absent
        if (!this.isExtensionExists(importName)) {
          importName += DEFAULT_FILE_EXTENSION;
        }

        // Determine if import should be ignored
        const ignored =
          ignoredImports.findIndex((ignoredImportRegex) =>
            ignoredImportRegex.test(importName)
          ) !== -1;

        let fullPath: string;
        // Check for tilde import.
        const tilde: boolean = importName.startsWith(TILDE);
        if (tilde && this.projectDirectory != null) {
          importName = `./${NODE_MODULES}/${importName.substr(
            TILDE.length,
            importName.length
          )}`;
          fullPath = resolve(this.projectDirectory, importName);
        } else {
          fullPath = resolve(dirnamePath, importName);
        }

        const importData: ImportData = {
          importString: match[0],
          tilde: tilde,
          path: importName,
          fullPath: fullPath,
          found: false,
          ignored: ignored,
        };

        await this.resolveImport(importData, includePaths);

        return importData;
      }
    );

    // Wait for all imports file names to be resolved
    const imports = await Promise.all(importsPromises);

    const bundleResult: BundleResult = {
      filePath: filePath,
      found: true,
    };

    const shouldCheckForDedupes = dedupeFiles != null && dedupeFiles.length > 0;

    // Bundle all imports
    const currentImports: BundleResult[] = [];
    for (const imp of imports) {
      let contentToReplace;

      let currentImport: BundleResult;

      // If neither import file, nor partial is found
      if (!imp.found) {
        // Add empty bundle result with found: false
        currentImport = {
          filePath: imp.fullPath,
          tilde: imp.tilde,
          found: false,
          ignored: imp.ignored,
        };
      } else if (this.usedImports[imp.fullPath] == null) {
        // Add it to used imports
        this.usedImports[imp.fullPath] = 1;

        // If file is not yet in the registry
        // Read
        const impContent =
          this.fileRegistry[imp.fullPath] == null
            ? await readFile(imp.fullPath, 'utf-8')
            : (this.fileRegistry[imp.fullPath] as string);

        // and bundle it
        const bundledImport = await this._bundle(
          imp.fullPath,
          impContent,
          dedupeFiles,
          includePaths,
          ignoredImports
        );

        // Then add its bundled content to the registry
        this.fileRegistry[imp.fullPath] = bundledImport.bundledContent;

        // And whole BundleResult to current imports
        currentImport = bundledImport;
      } else {
        // File is in the registry
        // Increment it's usage count
        if (this.usedImports != null) {
          this.usedImports[imp.fullPath]++;
        }

        // Resolve child imports, if there are any
        let childImports: BundleResult[] = [];
        if (this.importsByFile != null) {
          childImports = this.importsByFile[imp.fullPath];
        }

        // Construct and add result to current imports
        currentImport = {
          filePath: imp.fullPath,
          tilde: imp.tilde,
          found: true,
          imports: childImports,
        };
      }

      if (imp.ignored) {
        if (this.usedImports[imp.fullPath] > 1) {
          contentToReplace = '';
        } else {
          contentToReplace = imp.importString;
        }
      } else {
        // Take contentToReplace from the fileRegistry
        contentToReplace = this.fileRegistry[imp.fullPath];
        // If the content is not found
        if (contentToReplace == null) {
          // Indicate this with a comment for easier debugging
          contentToReplace = `/*** IMPORTED FILE NOT FOUND ***/${EOL}${imp.importString}/*** --- ***/`;
        }

        // If usedImports dictionary is defined
        if (shouldCheckForDedupes && this.usedImports != null) {
          // And current import path should be deduped and is used already
          const timesUsed = this.usedImports[imp.fullPath];
          if (
            dedupeFiles.indexOf(imp.fullPath) !== -1 &&
            timesUsed != null &&
            timesUsed > 1
          ) {
            // Reset content to replace to an empty string to skip it
            contentToReplace = '';
            // And indicate that import was deduped
            currentImport.deduped = true;
          }
        }
      }
      // Finally, replace import string with bundled content or a debug message
      content = this.replaceLastOccurance(
        content,
        imp.importString,
        contentToReplace
      );

      // And push current import into the list
      currentImports.push(currentImport);
    }

    // Set result properties
    bundleResult.bundledContent = content;
    bundleResult.imports = currentImports;

    if (this.importsByFile != null) {
      this.importsByFile[filePath] = currentImports;
    }

    return bundleResult;
  }

  private replaceLastOccurance(
    content: string,
    importString: string,
    contentToReplace: string
  ): string {
    const index = content.lastIndexOf(importString);
    return (
      content.slice(0, index) +
      content.slice(index).replace(importString, contentToReplace)
    );
  }

  private removeImportsFromComments(text: string): string {
    const patterns = [COMMENT_PATTERN, MULTILINE_COMMENT_PATTERN];

    for (const pattern of patterns) {
      text = text.replace(pattern, (x) => x.replace(IMPORT_PATTERN, ''));
    }

    return text;
  }

  private async resolveImport(
    importData: ImportData,
    includePaths: string[]
  ): Promise<ImportData> {
    if (this.fileRegistry[importData.fullPath]) {
      importData.found = true;
      return importData;
    }

    try {
      await access(importData.fullPath);
      importData.found = true;
    } catch (error) {
      const underscoredDirname = dirname(importData.fullPath);
      const underscoredBasename = basename(importData.fullPath);
      const underscoredFilePath = join(
        underscoredDirname,
        `_${underscoredBasename}`
      );
      try {
        await access(underscoredFilePath);
        importData.fullPath = underscoredFilePath;
        importData.found = true;
      } catch (underscoreErr) {
        // If there are any includePaths
        if (includePaths.length) {
          // Resolve fullPath using its first entry
          importData.fullPath = resolve(includePaths[0], importData.path);
          // Try resolving import with the remaining includePaths
          const remainingIncludePaths = includePaths.slice(1);
          return this.resolveImport(importData, remainingIncludePaths);
        }
      }
    }

    return importData;
  }

  private async globFilesOrEmpty(globsList: string[]): Promise<string[]> {
    return new Promise<string[]>((resolveValue, reject) => {
      if (globsList == null || globsList.length === 0) {
        resolveValue([]);
        return;
      }
      globs(globsList, (error: Error | null, files: string[]) => {
        if (error != null) {
          reject(error);
        }

        const fullPaths = files.map((file) => resolve(file));
        resolveValue(fullPaths);
      });
    });
  }
}
