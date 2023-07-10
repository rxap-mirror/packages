import {Dependency} from './dependency';
import {PackageExportsEntryObject} from './package-exports-entry-object';
import {PackageExportsEntryOrFallback} from './package-exports-entry-or-fallback';
import {PackageExportsEntryPath} from './package-exports-entry-path';
import {PackageExportsFallback} from './package-exports-fallback';
import {Person} from './person';
import {ScriptsInstallAfter} from './scripts-install-after';
import {ScriptsPublishAfter} from './scripts-publish-after';
import {ScriptsRestart} from './scripts-restart';
import {ScriptsStart} from './scripts-start';
import {ScriptsStop} from './scripts-stop';
import {ScriptsTest} from './scripts-test';
import {ScriptsUninstallBefore} from './scripts-uninstall-before';
import {ScriptsVersionBefore} from './scripts-version-before';

export interface PackageJson {
  /** The name of the package. */
  name?: string;
  /** Version must be parseable by node-semver, which is bundled with npm as a dependency. */
  version?: string;
  /** This helps people discover your package, as it's listed in 'npm search'. */
  description?: string;
  /** This helps people discover your package as it's listed in 'npm search'. */
  keywords?: Array<string>;
  /** The url to the project homepage. */
  homepage?: string;
  /** The url to your project's issue tracker and / or the email address to which issues should be reported. These are helpful for people who encounter issues with your package. */
  bugs?: string | {
    /** The url to your project's issue tracker. */
    url?: string;
    /** The email address to which issues should be reported. */
    email?: string;
  };
  /** You should specify a license for your package so that people know how they are permitted to use it, and any restrictions you're placing on it. */
  license?: string;
  /** DEPRECATED: Instead, use SPDX expressions, like this: { "license": "ISC" } or { "license": "(MIT OR Apache-2.0)" } see: 'https://docs.npmjs.com/files/package.json#license'. */
  licenses?: Array<{
    type?: string;
    url?: string;
  }>;
  author?: Person;
  /** A list of people who contributed to this package. */
  contributors?: Array<Person>;
  /** A list of people who maintains this package. */
  maintainers?: Array<Person>;
  /** The 'files' field is an array of files to include in your project. If you name a folder in the array, then it will also include the files inside that folder. */
  files?: Array<string>;
  /** The main field is a module ID that is the primary entry point to your program. */
  main?: string;
  /** The "exports" field is used to restrict external access to non-exported module files, also enables a module to import itself using "name". */
  exports?: PackageExportsEntryPath | {
    /** The module path that is resolved when the module specifier matches "name", shadows the "main" field. */
    '.'?: PackageExportsEntryOrFallback;
    /** The module path prefix that is resolved when the module specifier starts with "name/", set to "./" to allow external modules to import any subpath. */
    './'?: PackageExportsEntryOrFallback;
  } & Record<string, PackageExportsEntryOrFallback> | PackageExportsEntryObject | PackageExportsFallback;
  bin?: string | Record<string, string>;
  /** When set to "module", the type field allows a package to specify all .js files within are ES modules. If the "type" field is omitted or set to "commonjs", all .js files are treated as CommonJS. */
  type?: 'commonjs' | 'module';
  /** Set the types property to point to your bundled declaration file. */
  types?: string;
  /** Note that the "typings" field is synonymous with "types", and could be used as well. */
  typings?: string;
  /** The "typesVersions" field is used since TypeScript 3.1 to support features that were only made available in newer TypeScript versions. */
  typesVersions?: Record<string, {
    /** Maps all file paths to the file paths specified in the array. */
    '*'?: Array<string>;
  } & Record<string, Array<string>> & Record<string, Array<string>>>;
  /** Specify either a single file or an array of filenames to put in place for the man program to find. */
  man?: string | Array<string>;
  directories?: {
    /** If you specify a 'bin' directory, then all the files in that folder will be used as the 'bin' hash. */
    bin?: string;
    /** Put markdown files in here. Eventually, these will be displayed nicely, maybe, someday. */
    doc?: string;
    /** Put example scripts in here. Someday, it might be exposed in some clever way. */
    example?: string;
    /** Tell people where the bulk of your library is. Nothing special is done with the lib folder in any way, but it's useful meta info. */
    lib?: string;
    /** A folder that is full of man pages. Sugar to generate a 'man' array by walking the folder. */
    man?: string;
    test?: string;
  };
  /** Specify the place where your code lives. This is helpful for people who want to contribute. */
  repository?: string | {
    type?: string;
    url?: string;
    directory?: string;
  };
  /** The 'scripts' member is an object hash of script commands that are run at various times in the lifecycle of your package. The key is the lifecycle event, and the value is the command to run at that point. */
  scripts?: {
    /** Run BEFORE the package is published (Also run on local npm install without any arguments). */
    prepublish?: string;
    /** Run both BEFORE the package is packed and published, and on local npm install without any arguments. This is run AFTER prepublish, but BEFORE prepublishOnly. */
    prepare?: string;
    /** Run BEFORE the package is prepared and packed, ONLY on npm publish. */
    prepublishOnly?: string;
    /** run BEFORE a tarball is packed (on npm pack, npm publish, and when installing git dependencies). */
    prepack?: string;
    /** Run AFTER the tarball has been generated and moved to its final destination. */
    postpack?: string;
    publish?: ScriptsPublishAfter;
    postpublish?: ScriptsPublishAfter;
    /** Run BEFORE the package is installed. */
    preinstall?: string;
    install?: ScriptsInstallAfter;
    postinstall?: ScriptsInstallAfter;
    preuninstall?: ScriptsUninstallBefore;
    uninstall?: ScriptsUninstallBefore;
    /** Run AFTER the package is uninstalled. */
    postuninstall?: string;
    preversion?: ScriptsVersionBefore;
    version?: ScriptsVersionBefore;
    /** Run AFTER bump the package version. */
    postversion?: string;
    pretest?: ScriptsTest;
    test?: ScriptsTest;
    posttest?: ScriptsTest;
    prestop?: ScriptsStop;
    stop?: ScriptsStop;
    poststop?: ScriptsStop;
    prestart?: ScriptsStart;
    start?: ScriptsStart;
    poststart?: ScriptsStart;
    prerestart?: ScriptsRestart;
    restart?: ScriptsRestart;
    postrestart?: ScriptsRestart;
  } & Record<string, string>;
  /** A 'config' hash can be used to set configuration parameters used in package scripts that persist across upgrades. */
  config?: Record<string, any>;
  dependencies?: Dependency;
  devDependencies?: Dependency;
  optionalDependencies?: Dependency;
  peerDependencies?: Dependency;
  /** When a user installs your package, warnings are emitted if packages specified in "peerDependencies" are not already installed. The "peerDependenciesMeta" field serves to provide more information on how your peer dependencies are utilized. Most commonly, it allows peer dependencies to be marked as optional. Metadata for this field is specified with a simple hash of the package name to a metadata object. */
  peerDependenciesMeta?: Record<string, {
    /** Specifies that this peer dependency is optional and should not be installed automatically. */
    optional?: boolean;
  } & Record<string, any>>;
  /** Array of package names that will be bundled when publishing the package. */
  bundledDependencies?: Array<string> | boolean;
  /** DEPRECATED: This field is honored, but "bundledDependencies" is the correct field name. */
  bundleDependencies?: Array<string> | boolean;
  /** Resolutions is used to support selective version resolutions, which lets you define custom package versions or ranges inside your dependencies. See: https://classic.yarnpkg.com/en/docs/selective-version-resolutions */
  resolutions?: any;
  engines?: {
    node?: string;
  } & Record<string, string>;
  engineStrict?: boolean;
  /** Specify which operating systems your module will run on. */
  os?: Array<string>;
  /** Specify that your code only runs on certain cpu architectures. */
  cpu?: Array<string>;
  /** DEPRECATED: This option used to trigger an npm warning, but it will no longer warn. It is purely there for informational purposes. It is now recommended that you install any binaries as local devDependencies wherever possible. */
  preferGlobal?: boolean;
  /** If set to true, then npm will refuse to publish it. */
  private?: boolean | any;
  publishConfig?: {
    access?: 'public' | 'restricted';
    tag?: string;
    registry?: string;
  } & Record<string, any>;
  dist?: {
    shasum?: string;
    tarball?: string;
  };
  readme?: string;
  /** An ECMAScript module ID that is the primary entry point to your program. */
  module?: string;
  /** A module ID with untranspiled code that is the primary entry point to your program. */
  esnext?: string | {
    main?: string;
    browser?: string;
  } & Record<string, string>;
  /** Allows packages within a directory to depend on one another using direct linking of local files. Additionally, dependencies within a workspace are hoisted to the workspace root when possible to reduce duplication. Note: It's also a good idea to set "private" to true when using this feature. */
  workspaces?: Array<string> | {
    /** Workspace package paths. Glob patterns are supported. */
    packages?: Array<string>;
    /** Packages to block from hoisting to the workspace root. Currently only supported in Yarn only. */
    nohoist?: Array<string>;
  };

  [key: string]: any;
}
