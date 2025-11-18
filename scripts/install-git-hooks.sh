#!/bin/bash
#
# Install git hooks for the Sprout project
# Run this script to set up pre-commit hooks that automatically
# format, lint, type-check, and test your code before each commit
#

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Installing git hooks for Sprout project...${NC}"
echo ""

# Get the repository root directory
REPO_ROOT="$(git rev-parse --show-toplevel)"
GIT_HOOKS_DIR="$REPO_ROOT/.git/hooks"
SOURCE_HOOKS_DIR="$REPO_ROOT/scripts/git-hooks"

# Create hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Install pre-commit hook
if [ -f "$SOURCE_HOOKS_DIR/pre-commit" ]; then
    cp "$SOURCE_HOOKS_DIR/pre-commit" "$GIT_HOOKS_DIR/pre-commit"
    chmod +x "$GIT_HOOKS_DIR/pre-commit"
    echo -e "${GREEN}✅ Installed pre-commit hook${NC}"
else
    echo "❌ pre-commit hook not found in $SOURCE_HOOKS_DIR"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Git hooks installed successfully!${NC}"
echo ""
echo "The following checks will now run automatically before each commit:"
echo "  1. deno fmt - Format code"
echo "  2. deno lint - Lint code"
echo "  3. deno check - Type check"
echo "  4. deno test - Run tests"
echo ""
echo "If any check fails, the commit will be aborted."
echo "This helps maintain code quality and prevents CI/CD failures."
echo ""
