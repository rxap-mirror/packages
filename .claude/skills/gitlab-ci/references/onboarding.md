# Onboarding to GitLab

Load this when the user has no GitLab project on their git remote yet and the workflow needs to walk them through creating one and pushing. Triggered from Workflow 1 step 1.8 when `git remote -v` returns no GitLab remote, or when the user explicitly says they are new to GitLab.

## Contents

- Prerequisites
- Step 1: Create a project at `gitlab.com/projects/new`
- Step 2: Add the GitLab remote
- Step 3: First push
- Step 4: Watch the pipeline
- CI/CD Variables (for the user's secrets)
- Permission-asking checklist
- Free-tier runner reassurance

## Prerequisites

The user needs:

- A free GitLab.com account. If they do not have one, point them at <https://gitlab.com/users/sign_up> first. Free is enough for the entire flow described here.
- `git` installed locally (already true if they have the project under git).

That is the whole list. The user does **not** need to install GitLab Runner, configure CI/CD variables ahead of time, or have a paid tier.

## Step 1: Create a project at `gitlab.com/projects/new`

This step happens in the user's browser. Do not try to do it via the API on their behalf without explicit permission.

Tell the user:

1. Open <https://gitlab.com/projects/new>.
2. Click "Create blank project".
3. Pick a project name and a namespace (their personal namespace is fine; a group is fine if they have one).
4. **Leave "Initialize repository with a README" unchecked.** They already have a local repo; the GitLab project should start empty so the push lands cleanly.
5. Click "Create project".

When they confirm the project exists, ask for the project URL (e.g., `https://gitlab.com/<their-namespace>/<project>`). The agent uses that URL to write the `git remote add` command in step 2.

## Step 2: Add the GitLab remote

Ask for explicit permission before running any `git remote` command on the user's machine.

The user can choose SSH or HTTPS. Use whichever they prefer; ask if they have an SSH key set up at <https://gitlab.com/-/user_settings/ssh_keys>.

```bash
# SSH (recommended if the user has an SSH key on gitlab.com)
git remote add gitlab git@gitlab.com:<namespace>/<project>.git

# HTTPS (works without an SSH key; will prompt for credentials on push)
git remote add gitlab https://gitlab.com/<namespace>/<project>.git
```

After the command runs, verify with `git remote -v`. The new `gitlab` remote should appear.

If the user already has a remote named `gitlab` pointed elsewhere, ask whether to overwrite it (`git remote set-url gitlab ...`) or use a different name (e.g., `gitlab-new`). Do not silently overwrite.

## Step 3: First push

Ask for explicit permission. This sends every local commit to GitLab.

```bash
git push -u gitlab <branch-name>
```

`<branch-name>` is usually `main` or the user's current branch (`git branch --show-current`). The `-u` flag sets the upstream so subsequent `git push` works without arguments.

If the user has many local branches, push them one at a time to start with; bulk pushes can be done after they confirm the pipeline behaves as expected on the first branch.

## Step 4: Watch the pipeline

The moment the push lands, GitLab detects `.gitlab-ci.yml` and creates a pipeline automatically. The user finds it at:

```
https://gitlab.com/<namespace>/<project>/-/pipelines
```

Or, in the project UI, **Build > Pipelines** in the left sidebar.

Each job links to its log. The job log shows the runner that picked it up, the image that was pulled, every line of `script:` output, and the exit status.

If the pipeline fails, switch to Workflow 3 (Debug) and offer to read the failing job's log (paste or URL).

## CI/CD Variables (for the user's secrets)

If the generated pipeline references any variable that should be a secret (e.g., `$NPM_TOKEN`, `$AWS_SECRET_ACCESS_KEY`, deploy credentials), the user configures these in the GitLab UI:

1. **Project > Settings > CI/CD > Variables**.
2. Click "Add variable".
3. Name: the variable as referenced in the YAML (e.g., `NPM_TOKEN`).
4. Value: the secret itself.
5. **Mark "Masked"** so the value is replaced with `[MASKED]` in job logs.
6. **Mark "Protected"** so the value is only available to jobs running on protected branches and tags. (Configure protected branches under **Settings > Repository > Protected branches**; `main` is protected by default.)
7. Save.

Tell the user to configure these before pushing a commit that runs the deploy job. Otherwise the job will fail at runtime with an undefined-variable error.

For production secrets at scale, point the user at GitLab's external secret managers (see the Secret handling section in `SKILL.md`): Vault, AWS Secrets Manager, GCP Secret Manager, Azure Key Vault via OIDC ID tokens. Premium / Ultimate tier.

## Permission-asking checklist

Get explicit permission before each of these. Approval for one does not extend to the next.

| Action | Why permission is needed |
|---|---|
| `git remote add <name> <url>` | Modifies the user's git config |
| `git remote set-url ...` | Modifies the user's git config |
| `git push ...` | Sends code to gitlab.com |
| `git push --force` | Overwrites remote history; almost never the right call here |
| Creating a project via API | The user usually creates it in the UI; if they want API creation, ask explicitly |
| Setting CI/CD variables via API | Always have the user do this in the UI; do not handle their secrets in chat or pass them via shell history |

If the user says "go ahead with all the git stuff", that authorisation covers steps 2 and 3 above (remote add + first push). It does **not** cover destructive operations like `--force` or `reset --hard`; those still need explicit per-action permission.

## Free-tier runner reassurance

If the user asks "where will my jobs actually run?", the answer is:

> On GitLab.com's free hosted runners. They are managed by GitLab, available immediately, no setup. Linux, Windows, and macOS jobs are supported. Each job runs on a fresh VM.

The user does **not** need to install GitLab Runner, register a custom runner, or configure anything about execution infrastructure. That is GitLab.com's job. The first pipeline run will use these hosted runners automatically.

If they later need custom runners (on-prem, GPU, custom OS, compliance), point them at <https://docs.gitlab.com/ci/runners/> after the first pipeline runs green. Self-managed runners are out of scope for v1 onboarding.
