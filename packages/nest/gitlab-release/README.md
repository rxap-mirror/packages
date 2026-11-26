NestJS service for GitLab releases: list releases as options, filter them (environment tier, asset presence) and check whether a release asset is downloadable. Builds on @rxap/nest-gitlab.

[![npm version](https://img.shields.io/npm/v/@rxap/nest-gitlab-release?style=flat-square)](https://www.npmjs.com/package/@rxap/nest-gitlab-release)
[![commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg?style=flat-square)](https://commitizen.github.io/cz-cli/)
[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![Libraries.io dependency status for latest release, scoped npm package](https://img.shields.io/librariesio/release/npm/@rxap/nest-gitlab-release)
![npm](https://img.shields.io/npm/dm/@rxap/nest-gitlab-release)
![NPM](https://img.shields.io/npm/l/@rxap/nest-gitlab-release)

- [Installation](#installation)
- [Get started](#get-started)

# Installation

**Add the package to your workspace:**
```bash
npm install @rxap/nest-gitlab-release
```
With pnpm or yarn use `pnpm add` or `yarn add` instead of `npm install`.

**Install peer dependencies:**
```bash
npm install @nestjs/common @gitbeaker/rest @rxap/nest-dto @rxap/nest-gitlab @rxap/nest-open-api class-transformer 
```
# Get started

Release helpers on top of [`@rxap/nest-gitlab`](https://www.npmjs.com/package/@rxap/nest-gitlab).

```bash
pnpm add @rxap/nest-gitlab-release@development @rxap/nest-gitlab@development
```

```ts
@Module({
  imports: [GitlabModule.registerAsync({ /* see @rxap/nest-gitlab */ }), GitlabReleaseModule],
})
export class AppModule {}
```

`GitlabReleaseService`:

* `getReleases(projectId, filter?)` - releases as `OptionsDto<tag, name>[]` (max. 5 pages of 100, stops at the first
  page with a match); errors are logged and result in an empty list.
* `assetExists(projectId, release, fileName)` - checks that a release asset is downloadable without downloading it
  (`release = 'latest'` uses GitLab's `permalink/latest`).
* `getAssetDownloadLink(projectId, release, fileName)`

Filters: `gitlabReleaseHasAsset(fileName)`, `gitlabReleaseEnvironmentTierFilter(tier)`.

The release *channel* filters (`gitlabReleaseChannelFilter`, `environmentTierToReleaseChannel`) depend on
`@rxap/nest-app-artifacts`, which is not part of this workspace, and therefore stay in the consuming application.

