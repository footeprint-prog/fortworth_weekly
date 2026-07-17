# GitHub integration status

## Current status: repository is readable, write operations are blocked

On July 16, 2026, the connected GitHub account resolved as `footeprint-prog`, and the repository metadata for `footeprint-prog/fortworth_weekly` reported administrative and push permissions. However, every attempted mutation returned HTTP 403 with `Resource not accessible by integration`, including:

- Contents API file creation
- Git Data API blob creation
- Issue creation

The connector also returned no active GitHub App installations. This means the repository can be discovered through the connected account, but the integration is not currently installed with usable write permissions for repository contents or issues.

## Recovery artifacts

The current project is preserved as:

- a clean source ZIP
- a Git bundle with coherent local commit history
- a repository ZIP containing the local `.git` history

No code or research work depends on the remote repository being writable.

## Required GitHub fix

Reconnect or install the ChatGPT/OpenAI GitHub integration for `footeprint-prog`, explicitly grant access to `fortworth_weekly`, and allow repository contents and issues to be written. After reconnecting, verify that the integration appears as an active installation before retrying publication.

## Publication target

- Repository: `footeprint-prog/fortworth_weekly`
- Branch: `main`
- Pages source: GitHub Actions
