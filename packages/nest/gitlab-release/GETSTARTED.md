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
