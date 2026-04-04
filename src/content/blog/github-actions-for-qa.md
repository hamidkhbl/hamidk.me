---
title: "GitHub Actions for QA: A Practical Setup"
description: "How to set up GitHub Actions workflows that run your test suites on every pull request and report results clearly."
pubDate: 2024-06-05
tags: ["ci-cd", "github-actions", "automation"]
category: "ci-cd"
draft: false
---

GitHub Actions is my go-to for QA pipelines. It's free for public repos, tightly integrated with PRs, and YAML-based workflows are easy to version and review.

## Basic test workflow

```yaml
name: Test Suite

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: pip install -r requirements.txt

      - name: Run tests
        run: pytest --tb=short --junitxml=results.xml

      - name: Upload results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: results.xml
```

The `if: always()` is critical — you want artifacts even when tests fail.

## Parallelizing with matrix

```yaml
strategy:
  matrix:
    browser: [chromium, firefox, webkit]

steps:
  - name: Run E2E tests
    run: npx playwright test --project=${{ matrix.browser }}
```

Three browsers run in parallel. Total CI time stays the same as running one.

## PR status checks

In your repo settings → Branch protection rules, require the `test` job to pass before merging. This makes broken tests a merge blocker — not a "we'll fix it later."

## Caching dependencies

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('requirements.txt') }}
```

Saves 30-60 seconds per run. Small thing, adds up across a team.

## Notifications

Add a Slack notification step at the end to alert the team on main branch failures — not on every PR, that gets noisy fast.
