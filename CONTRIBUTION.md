How to contribution to the project
===

# Merge Request

Each merge request should be related to at least one issue. To ensure this connection it is recommended to create a new
merge request from the issue page with the *Create merge request* button.

**Important**: the target of the merge request should always be the branch: `development`

# Commit Message Format

*This specification is inspired by and supersedes the [AngularJS commit message format][commit-message-format].*

Each commit message consists of a **header**, a **body**, and a **footer**.

```
<header>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

The `header` is **mandatory** and must conform to the [Commit Message Header](#commit-message-header) format.

The `body` is **optional** for all commits. When the body is present it must be at least 20 characters long and must
conform to the [Commit Message Body](#commit-message-body) format.

The `footer` is **optional**. The [Commit Message Footer](#commit-message-footer) format describes what the footer is
used for and the structure it must have.

#### Commit Message Header

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: pwa|server
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test|wip
```

The `<type>` and `<summary>` fields are mandatory, the `(<scope>)` field is optional.

##### Type

Must be one of the following:

* **build**: Changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
* **ci**: Changes to our CI configuration files and scripts (examples: CircleCi, SauceLabs)
* **docs**: Documentation only changes
* **feat**: A new feature
* **fix**: A bug fix
* **perf**: A code change that improves performance
* **refactor**: A code change that neither fixes a bug nor adds a feature
* **test**: Adding missing tests or correcting existing tests
* **wip**: Working on a bug fix or new feature. Should be avoided and only be used in merge branches or squashed before
  pushing

##### Scope

The scope should be the name of the application affected (as perceived by the person reading the changelog generated
from commit messages).

The following is the list of supported scopes:

* `pwa`
* `server`
* none/empty string: useful for `test` and `refactor` changes that are done across all packages (
  e.g. `test: add missing unit tests`) and for docs changes that are not related to a specific package (
  e.g. `docs: fix typo in tutorial`).

##### Summary

Use the summary field to provide a succinct description of the change:

* use the imperative, present tense: "change" not "changed" nor "changes"
* don't capitalize the first letter
* no dot (.) at the end

#### Commit Message Body

Just as in the summary, use the imperative, present tense: "fix" not "fixed" nor "fixes".

Explain the motivation for the change in the commit message body. This commit message should explain _why_ you are
making the change. You can include a comparison of the previous behavior with the new behavior in order to illustrate
the impact of the change.

#### Commit Message Footer

The footer can contain information about breaking changes and deprecations and is also the place to reference GitHub
issues, Jira tickets, and other PRs that this commit closes or is related to. For example:

```
BREAKING CHANGE: <breaking change summary>
<BLANK LINE>
<breaking change description + migration instructions>
<BLANK LINE>
<BLANK LINE>
Fixes #<issue number>
```

or

```
DEPRECATED: <what is deprecated>
<BLANK LINE>
<deprecation description + recommended update path>
<BLANK LINE>
<BLANK LINE>
Closes #<pr number>
```

Breaking Change section should start with the phrase "BREAKING CHANGE: " followed by a summary of the breaking change, a
blank line, and a detailed description of the breaking change that also includes migration instructions.

Similarly, a Deprecation section should start with "DEPRECATED: " followed by a short description of what is deprecated,
a blank line, and a detailed description of the deprecation that also mentions the recommended update path.

### Revert commits

If the commit reverts a previous commit, it should begin with `revert: `, followed by the header of the reverted commit.

The content of the commit message body should contain:

- information about the SHA of the commit being reverted in the following format: `This reverts commit <SHA>`,
- a clear description of the reason for reverting the commit message.

[commit-message-format]: https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit#
