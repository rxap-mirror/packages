`@rxap/nest-gitlab` wraps the [`@gitbeaker/rest`](https://github.com/jdalrymple/gitbeaker) client as an injectable
Nest service (`GitlabService` extends the SDK's `Gitlab` class, so every SDK resource such as `gitlab.Projects`,
`gitlab.RepositoryFiles` or `gitlab.ProjectReleases` is available).

## Install

```bash
pnpm add @rxap/nest-gitlab@development
pnpm add @gitbeaker/rest @gitbeaker/requester-utils @nestjs/common @nestjs/config @nestjs/terminus @rxap/nest-utilities joi
```

`@gitbeaker/rest` is pinned to the `43.x` line. `44.x` is ESM-only and requires Node >= 24.16, which this
workspace (Node >= 22) does not support yet.

## Configuration (environment variables)

| Variable             | Default              | Description |
|----------------------|----------------------|-------------|
| `GITLAB_HOST`        | `https://gitlab.com` | Base url of the GitLab instance |
| `GITLAB_TOKEN`       | -                    | Sent as the `PRIVATE-TOKEN` header (personal, project, group access token) |
| `GITLAB_OAUTH_TOKEN` | -                    | Sent as `Authorization: Bearer <token>` (OAuth token) |
| `GITLAB_PROJECT`     | -                    | Optional default project: numeric id or full path (`group/subgroup/project`) |

* `GITLAB_TOKEN` and `GITLAB_OAUTH_TOKEN` are **mutually exclusive**; the package never falls back from one to the
  other. In production exactly one of them is required, otherwise both are optional (anonymous access).
* Which kind of token GitLab accepts depends on the token type (see [Token types](#token-types)); the caller chooses.

Add the schema to the app's `ConfigModule` validation:

```ts
ConfigModule.forRoot({
  validationSchema: Joi.object({
    ...gitlabValidationSchema(environment, { host: 'https://gitlab.example.com' }),
  }),
});
```

## Register the module

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ /* ... */ }),
    GitlabModule.registerAsync({
      imports: [ConfigModule],
      useClass: GitlabModuleOptionsFactory, // reads the variables above
    }),
  ],
})
export class AppModule {}
```

Without the config factory:

```ts
GitlabModule.register({ host: 'https://gitlab.example.com', oauthToken: process.env.X, project: 'group/project' });
GitlabModule.registerAsync({ useFactory: async () => ({ token: await loadToken() }) });
```

The module is global; `GitlabService`, `GitlabHealthIndicator` are available everywhere. A token may also be a
function returning a promise (resolved on each request).

## Use it

```ts
@Injectable()
export class DesignService {
  constructor(private readonly gitlab: GitlabService) {}

  async load(path: string, ref: string) {
    const projectId = this.gitlab.requireProject(); // GITLAB_PROJECT, throws if not configured
    return this.gitlab.RepositoryFiles.showRaw(projectId, path, ref);
  }
}
```

* `gitlab.project` - the configured default project (`string | number | undefined`)
* `gitlab.requireProject()` - the configured project or a descriptive error
* `gitlab.hasCredentials` - whether a token is configured

## Token types

| Option       | HTTP header                  | Typical token |
|--------------|------------------------------|---------------|
| `token`      | `PRIVATE-TOKEN: <token>`     | personal / project / group access token |
| `oauthToken` | `Authorization: Bearer ...`  | OAuth token (also accepted by GitLab for personal access tokens) |
| `jobToken`   | `JOB-TOKEN: <token>`         | CI job token (module option only, no env variable) |

GitLab documents that most token types work with both headers, but it is not verified for fine-grained tokens.
Configure the variant your token works with; if one is rejected with `401`, try the other. The package
does not retry with the other header.

## File fingerprint without the content

`GET /projects/:id/repository/files/:path` returns the whole file base64 encoded. To find out whether a (large)
file changed, use `HEAD` instead:

```ts
const fp = await gitlab.getFileFingerprint('designs/app.fig', 'main'); // project defaults to GITLAB_PROJECT
// { contentSha256, blobId, commitId, lastCommitId, fileName, filePath, ref, size, encoding, executeFilemode } | null

if (fp && fp.contentSha256 !== cachedSha256) {
  /* download again */
}
```

* The SDK has no `HEAD` support (its requester only offers get/post/put/patch/delete, `RepositoryFiles` has no
  head method), so the request is made with `fetch` using the SDK's url and token headers. Behaviour for `token`
  and `oauthToken` is the same as for every other call.
* Returns `null` on `404` (file does not exist at `ref`; GitLab also answers 404 for an unknown project/ref or one the
  token cannot see: a `HEAD` response has no body to tell them apart).
* Any other non-2xx status throws the SDK's `GitbeakerRequestError`; a response without the content hash header
  throws a plain `Error`.

## Errors

No own error classes. The SDK throws:

| Error                   | When                                    | Status |
|-------------------------|-----------------------------------------|--------|
| `GitbeakerRequestError` | non-2xx response                        | `error.cause.response.status`, `error.message` = GitLab's description |
| `GitbeakerRetryError`   | retries (429/5xx) exhausted             | none |
| `GitbeakerTimeoutError` | query timeout                           | none |

`getGitlabErrorStatus(error)` returns the HTTP status of such an error (or `undefined`).

## Health indicator

```ts
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthCheckService, private readonly gitlab: GitlabHealthIndicator) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.gitlab.isHealthy()]);
  }
}
```

It calls `GET /metadata`. With a token it is *down* when GitLab is unreachable or rejects the token (`httpStatus` is
reported). Without a token `/metadata` answers `401`; that still proves the instance is reachable, so it is *up*
(`authenticated: false`).

## Releases

The release helpers (`GitlabReleaseService`) live in [`@rxap/nest-gitlab-release`](https://www.npmjs.com/package/@rxap/nest-gitlab-release), so this package
has no dependency on `@rxap/nest-dto` / `@rxap/nest-open-api`.
