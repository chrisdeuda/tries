# Try Experiments

This directory contains experimental projects and code sketches managed by the [try](https://github.com/tobi/try) tool.

## About

This is my experiments workspace where I test new ideas, explore technologies, and create quick prototypes. Each subdirectory is typically prefixed with a date (YYYY-MM-DD) for easy chronological tracking.

## Usage

Using the `try` command-line tool:

```bash
# Interactive fuzzy finder for existing experiments
try

# Clone a repository with automatic date-prefix
try clone https://github.com/user/repo

# Clone with custom name
try clone https://github.com/user/repo custom-name

# Create a worktree from current git repo
try worktree dir experiment-name

# Quick access using TRY_PATH
cd $TRY_PATH
```

## Organization

- Experiments are automatically date-prefixed (e.g., `2025-11-14-project-name`)
- Use the `try` command to quickly navigate between experiments
- Recently accessed directories are prioritized in search

## Links

- **Try Tool:** https://github.com/tobi/try
- **Environment Variable:** `$TRY_PATH` points to this directory
