---
name: gitlab-issue-creation
description: Creates GitLab issues based on user input and project context.
---

You are an export gitlab issue creator.

Use the file `.agent/rules/gitlab-issue.md` to understand how a gitlab issue should be structured.

You should use the gitlab cli tool `glab` to create and manage issues.

You should use the command `glab issue create` to create a new issue.
```sh
$ glab issue create --help
Create an issue.

USAGE
  glab issue create [flags]

ALIASES
  new

FLAGS
  -a, --assignee usernames     Assign issue to people by their usernames.
  -c, --confidential           Set an issue to be confidential. (default false)
  -d, --description string     Issue description.
      --due-date string        A date in 'YYYY-MM-DD' format.
      --epic int               ID of the epic to add the issue to.
  -l, --label strings          Add label by name. Multiple labels should be comma-separated.
      --link-type string       Type for the issue link (default "relates_to")
      --linked-issues ints     The IIDs of issues that this issue links to.
      --linked-mr int          The IID of a merge request in which to resolve all issues.
  -m, --milestone string       The global ID or title of a milestone to assign.
      --no-editor              Don't open editor to enter a description. If set to true, uses prompt. (default false)
      --recover                Save the options to a file if the issue fails to be created. If the file exists, the options will be loaded from the recovery file. (EXPERIMENTAL)
  -e, --time-estimate string   Set time estimate for the issue.
  -s, --time-spent string      Set time spent for the issue.
  -t, --title string           Issue title.
      --web                    Continue issue creation with web interface.
  -w, --weight int             Issue weight. Valid values are greater than or equal to 0.
  -y, --yes                    Don't prompt for confirmation to submit the issue.

INHERITED FLAGS
  -h, --help              Show help for this command.
  -R, --repo OWNER/REPO   Select another repository. Can use either OWNER/REPO or `GROUP/NAMESPACE/REPO` format. Also accepts full URL or Git URL.

EXAMPLES
    $ glab issue create                                                                                                 
    $ glab issue new                                                                                                    
    $ glab issue create -m release-2.0.0 -t "we need this feature" --label important                                    
    $ glab issue new -t "Fix CVE-YYYY-XXXX" -l security --linked-mr 123                                                 
    $ glab issue create -m release-1.0.1 -t "security fix" --label security --web --recover                             

LEARN MORE
  Use 'glab <command> <subcommand> --help' for more information about a command.
```

### Label Management Logic

Before creating or updating an issue, Conductor MUST ensure all required labels exist in the GitLab project:

1.  **Fetch Existing Labels:** Execute `glab label list -P 100` to retrieve the current set of available labels and their descriptions.
2.  **Identify Missing Labels:** Compare the labels inferred from the track (see below) against the retrieved list.
3.  **Create Missing Labels:** If a required scoped label (e.g., `type::refactor`, `team::infrastructure`) does not exist, Conductor MUST create it before proceeding:
    ```bash
    glab label create --name "<label-name>" --description "<label-description>" --color "<hex-code>"
    ```
    *   **Colors:** Use standard project colors (e.g., `#0033CC` for `type`, `#009966` for `team`, `#FF0000` for `priority::critical`).

### Automated Label Inference

Conductor MUST automatically infer labels based on the track's context:

*   **Track Type (`type::<name>`):**
    *   Derived from the track description or explicit `type` field in `metadata.json`.
    *   Examples: `type::feature`, `type::bug`, `type::enhancement`, `type::technical-debt`.
*   **Project Scope (`project::<project-name>`):**
    *   If the track's scope is confined to a single Nx workspace project (e.g., `api-entities`, `ui-shared`), apply the corresponding project label.
*   **Priority (`priority::<level>`):**
    *   `priority::critical`: Keywords like "urgent", "security", "blocker", "broken".
    *   `priority::high`: Keywords like "important", "major", "required".
    *   `priority::medium`: Default.
    *   `priority::low`: Keywords like "minor", "backlog", "future".
*   **Team Assignment (`team::<name>`):**
    *   `team::frontend`: Work involving `ui/` or `@vault/ui-*` packages.
    *   `team::backend`: Work involving `api/` or `@vault/api-*` packages.
    *   `team::devops`: Work involving `docker/`, `.gitlab-ci.yml`, or infrastructure.
