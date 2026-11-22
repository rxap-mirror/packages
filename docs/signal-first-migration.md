# Signal-first / zoneless migration: breaking changes and behaviour fixes

Branch `refactor/signal-first`. All `@rxap/*` Angular libraries are standalone, signal-first and zoneless-ready.

## API breaking changes

- All `@Input()` / `@Output()` / `@ViewChild(ren)` / `@ContentChild(ren)` are `input()`, `output()`, `viewChild()`, `contentChild()`. Inputs are read by calling them (`this.x()`); outputs are `output()` refs (RxJS operators need `outputToObservable`).
- Constructor injection replaced by `inject()`. Subclasses must not rely on constructor parameters.
- All barrel NgModules were removed. Import the standalone directives/components directly. Removed: `RxapFormsModule`, `FormDirectivesModule`, `MaterialFormSystemModule`, `DataGridModule`, `ConfirmModule`, `HasPermissionModule`, `IconModule`, `TableSelectControlModule`, `ExpandRowModule`, `SelectRowModule`, `TableColumnMenuModule`, `TableFilterModule`, `TableRowActionsModule`, `WindowTableSelectModule`, `WindowSystemModule`, `WindowTaskBarModule`, currency pipe module, open-api table pipe module.
- Firebase `app-check` / `storage` NgModules replaced by `provide*` functions.
- `FormDirective`: outputs are `output()` refs; state members are signals.
- `AbstractTableRowAction`: no-arg constructor, `type` is a signal input.
- `TableDataSourceDirective.dataSource` is a `linkedSignal`.
- table-select: `*Input` aliases renamed; `OptionsFromMethodDirective` split into an abstract base.
- `ConfirmDirective` (`[rxapConfirm]`): position strategy is created per open (`createPositionStrategy()`).
- Remote-method directives: the `parameters` input executes when it is not `undefined` (previously `undefined` also triggered).
- `FilterHeaderRowDirective`: `inputs: [...]` alias replaced by the signal input `filterFormDefinition` (alias `rxap-filter-header-row`).
- Signal inputs cannot be re-declared or re-aliased in subclasses: use an abstract `@Directive()` base plus aliased inputs.
- Demo app and generators emit zoneless code (`provideZonelessChangeDetection()`, no zone.js polyfill).

## Behaviour changes from bug fixes found while adding tests

Callers may notice these.

- `validator`: `isInt` bounds compare numeric value (was string length); `isDate` accepts `Date`; `isIn` accepts a string haystack; `isFQDN` honours `allow_numeric_tld`; `isUUID` returns `false` for unknown versions; `isByteLength` without options works; `hasProperty` honours `value` and dotted paths.
- `utilities`: `RxapError` keeps its `stack`; `AssertDefinedAndNotNull` rejects `null`.
- `rxjs`: `throwIfEmpty` no longer drops `0` / `false`.
- `reflect-metadata`: metadata map/set copies are deep for subclasses; `change` proxy honours "initialized".
- `config`: `LoadConfigDefaultFromUrlParam` reads the configured param name.
- `workspace/utilities`: `CreateConfigurationMapMatchingWithTarget` honours `targetName`; `FindProjectByPath(recursive)` terminates at the root; `GetRootPackageJson` works with `FsTree`; `UpdateYamlDocument` awaits async updaters.
- `forms`: `IsInt` validator no longer inverted; `FormControlErrorDirective` hides the error template when the control becomes valid.
- `config`: `fetchContentViaHttp` errors (and so completes in the race) on fetch failure and aborts on unsubscribe; `ConfigLoaderService.load$` fills its cache.
- `data-source`: `DataSourceDirective` unsubscribes `hasError$` on reconnect and destroy.
- `theme`: `restoreDensity` uses the configured storage key. `authorization`: scope and permission regexes escape every dot and expand every wildcard.
- `open-api`: `validateResponse` now validates JSON-like responses (it skipped them) and skips other content types; mismatches only warn unless `strict` / `SchemaValidationMixin.STRICT`.
- `data-structure-tree`: lazy nodes (`hasChildren` without loaded children) are visible, so they can be expanded. `SelectRowService` without options is explicitly single-selection.
- `table-select`: `OpenTableSelectWindowDirective` disables the control synchronously and re-enables it in `finally` (no stuck-disabled control); the open-window guard now works.
- `error`: `HttpErrorInterceptor` passes the `HttpErrorResponse` to the code extractor.
- `material/table-select`: `TABLE_SELECT_METHOD` metadata key no longer collides with `TABLE_SELECT_TO_VALUE`.
- `async-action.directive`: rejection stops loading and enables `hasError$`.
- `theme`: partial colour palette plus `base` is completed.
- `changelog`, `service-worker`: dialogs close correctly and the update/reload runs.
- `nest-vault`: init failure rejects instead of hanging. `nest-openfga`: guard keeps the tuple modifier. `nest-rabbitmq`: connection errors reject.
- n8n nodes: `continueOnFail` error items are returned (yaml); empty trigger input parses as `{}`.
- Generators/schematics: no `serverId: ",` / `'undefined'` in generated open-api code; `GetAngularJson` prefers `workspace.json`; `@IsInstance(X, )` comma fixed; `CoerceFormProvidersFile` comment guard fixed; `FindProjectByPath`, `convert-to-buildable-library` and `init-component` fixed.

## Known open items

- `data-structure-tree` `Node.addChild`/`addChildren` have an inverted `end` flag (`end = true` prepends). Left as is because flipping it changes the API.
- table-select: without `@UseTableSelectToValue` the control holds the whole selected row (identity fallback) and only `selected[0]` is written.
- `validator` is a partial validator.js port (`isVAT` GB/IT only, missing `isURL`/`isEmail` options).
- `nest-open-api` build fails (`@rxap/nest-utilities` not resolvable); unrelated to this branch.
- `schematic-ts-morph` form-definition, table-action and operation rule files have low unit coverage; `schematic-angular` table-action schematics were not testable via the schematic runner.
- Coverage collection in `nx test` is inert (`--codeCoverage` is not a jest flag); measure with `npx jest --coverage`.
