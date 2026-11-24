# FigCraft design file: rxap Angular libraries

`packages/angular/rxap.figcraft` is a **generated** FigCraft file holding every component and directive the
ng-prism styleguides of `packages/angular/**` show. It links `packages/angular/angular-components.figcraft`
(Angular Material + CDK, generated the same way in the angular/components ng-prism styleguides) as a library. Don't
edit it by hand: change the showcase or the component, regenerate, and commit the result.

## What's in it

| Page | Content |
|---|---|
| `Overview` | What the file is and one line per library page |
| `- Angular` | divider |
| `@rxap/<package>` | one page per library in `packages/angular/*` with a styleguide, named like its npm package |
| `- Material` | divider |
| `@rxap/<package>` | one page per library in `packages/angular/material/*` |

On each page:

- one **section per folder** below `src/lib`, nested like the folders; classes directly in `src/lib` go into a
  section named like the library folder (a library whose classes are all in folders has no such section).
- one **component set per showcased component or directive**, named exactly like its **Angular selector** (the first
  one of the selector list, e.g. `rxap-navigate-back-button`, `td[rxap-boolean-cell]`, `[rxapConfirm]`; the
  description lists them all, the class, whether it is a component or a directive, and its import). Its variants are
  the ng-prism showcase variants (`variant=…`, one per relevant input combination) times the showcase states
  (`state=default|Hover|Focus visible|…`). Each variant's description is the template it renders. A dev resource
  links the source file on GitLab.

Colours, corner radii, typography and elevation are bound to the kit's variables and styles (`mat-sys`,
`mat-components`, `mat-sys-*` text and effect styles) wherever the CSS declares a Material token that renders the
captured value in light and dark. Switch `mat-sys` between `Light` and `Dark` on a page to see the dark scheme.
Colours of our own CSS without a Material token stay literal (`tmp/figcraft-cache/build-report.json` lists them per
class).

## Regenerating

```bash
yarn figcraft          # prism-build of every library (sequential), capture, build, verify
```

or step by step:

```bash
yarn nx run-many -t prism-build --parallel=1   # static styleguides in dist/prism/<project>
yarn figcraft:capture  # renders every variant/state (Playwright) -> tmp/figcraft-cache/
yarn figcraft:build    # writes packages/angular/rxap.figcraft (figcraft-cli, headless) and publishes it as a library
yarn figcraft:verify   # coverage + visual diff vs. the browser; report in tmp/figcraft-cache/verify/report.md
```

All three scripts take `--project <nx project>[,…]` for a quick look at a few libraries
(`yarn figcraft:build --project angular-layout --out /tmp/x.figcraft`); capture and build also take `--only ClassA,ClassB`.
`prism-build` targets must not run in parallel (they share `applications/prism-host`).

Requirements: `figcraft-cli` on the `PATH`, Playwright's Chromium (`~/.cache/ms-playwright`), `unzip`/`zip`.

### How it works

The scripts are a port of the pipeline that generates `angular-components.figcraft` (angular/components,
`prism/scripts/figcraft`); `serialize-dom.js`, `declared.mjs`, `tokens.mjs`, `token-model.mjs` and `keep-ids.mjs`
are taken over unchanged.

1. **Capture** (`capture.mjs`): serves each static styleguide build, opens every showcase variant in ng-prism's
   capture mode (`?component=<Class>&variant=<n>&state=<m>&capture=1`), turns the DOM into a layer tree
   (`serialize-dom.js`), reads the CSS declaration that wins for each colour/radius/typography property
   (`declared.mjs`, keeping the `var(--mat-…)` chain), and takes PNGs in light and dark. Selector, source file,
   section path and the template of each variant are read from the class's `@Component` / `@Directive` and
   `@Showcase` decorators. The clock is fixed (2026-01-15, UTC).
2. **Build** (`build.mjs`): links the kit, replays every layer tree through `figcraft-cli run`, binds each value to
   the kit variable of its declared token **only if that token renders the captured value in light and dark**,
   combines the variants, arranges the canvas (figcraft-design rule 6a) and publishes the library. A rebuild keeps
   the previous file's ids (`keep-ids.mjs`), so files linking rxap.figcraft get updates instead of a new library.
3. **Verify** (`verify.mjs`): coverage (every component and directive with a selector has a component set on its
   library's page with every captured variant, or is listed as without a showcase), a visual diff in Light and Dark
   mode against the browser PNGs (shift-tolerant by one pixel; `maxDiff` in [`overrides.json`](overrides.json)) and
   the canvas layout.

### Configuration

[`overrides.json`](overrides.json) per class: `skip` (with a reason), `open` (how to open a surface the showcase
only shows after an interaction: `action`, `selector`, `overlayOnly`, `variants`) and `maxDiff`.

## Known limits

- Only what has an `@Showcase` is drawn; `verify` lists every component and directive without one. Add a showcase
  (skill `ng-prism:showcase`) and regenerate.
- Text wraps and advances a little differently in FigCraft than in Chrome (glyph metrics), so long strings end a
  few pixels earlier or later.
- Controls Chrome draws itself (unstyled `<button>`, `<input>`) are redrawn after Chrome's look.
- Material elements inside our components are drawn as captured layers, not as instances of the kit's components.
- Ripples and animations are frozen by the capture mode and not drawn.
