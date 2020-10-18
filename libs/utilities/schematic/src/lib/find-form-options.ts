import { Tree } from '@angular-devkit/schematics';
import {
  Path,
  NormalizedRoot,
  dirname,
  normalize
} from '@angular-devkit/core';
import { join } from 'path';

export function findFromOptions(
  host: Tree,
  startSearchPath: Path,
  nameFragment: string,
  fileExtensions: string[] = []
): Path | undefined {

  if (startSearchPath[ 0 ] !== '/') {
    startSearchPath = normalize(`/${startSearchPath}`);
  }

  startSearchPath = normalize(`${startSearchPath}/${nameFragment}`);

  const candidatePaths = [];

  for (let dir = startSearchPath; dir !== NormalizedRoot; dir = dirname(dir)) {
    candidatePaths.push(dir);
  }

  const candidateFileSuffixes = [ '', nameFragment ];

  for (const ext of fileExtensions) {
    candidateFileSuffixes.push(`${nameFragment}${ext}`);
  }

  for (const candidatePath of candidatePaths) {
    for (const candidateFileSuffix of candidateFileSuffixes) {
      const candidateFile = join(candidatePath, candidateFileSuffix);
      if (host.exists(candidateFile)) {
        return normalize(candidateFile);
      }
    }
  }

  for (const candidateFileSuffix of candidateFileSuffixes.filter(Boolean)) {
    const candidateFile = normalize(`/${candidateFileSuffix}`);
    if (host.exists(candidateFile)) {
      return normalize(candidateFile);
    }
  }

  return undefined;
}
