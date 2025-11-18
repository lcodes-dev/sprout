# Git Hooks

This directory contains git hooks that help maintain code quality by automatically running checks before commits.

## Installation

From the repository root, run:

```bash
./scripts/install-git-hooks.sh
```

## What the pre-commit hook does

The pre-commit hook runs automatically before each commit and performs the following checks:

1. **Format** - `deno fmt` - Automatically formats all code
2. **Lint** - `deno lint` - Checks for code quality issues
3. **Type Check** - `deno check src/main.ts` - Verifies TypeScript types
4. **Test** - `deno test --allow-all` - Runs all tests

If any check fails, the commit is blocked and you'll see an error message indicating what needs to be fixed.

## Why use git hooks?

- ✅ **Prevents CI/CD failures** - The same checks run in CI/CD, so passing them locally means your build will pass
- ✅ **Saves time** - Catch issues immediately instead of waiting for CI/CD
- ✅ **Maintains quality** - Ensures all committed code meets project standards
- ✅ **Automatic** - You don't have to remember to run checks manually

## Bypassing the hook (NOT RECOMMENDED)

If you absolutely need to commit without running checks (not recommended):

```bash
git commit --no-verify -m "your message"
```

**Warning:** This should only be used in exceptional circumstances, as it can lead to CI/CD failures.

## Uninstalling

To remove the pre-commit hook:

```bash
rm .git/hooks/pre-commit
```

## Updating hooks

If the hooks in this directory are updated, run the installation script again:

```bash
./scripts/install-git-hooks.sh
```
