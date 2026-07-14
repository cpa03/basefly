name: "CodeQL Security Analysis"

on:
push:
branches: ["main"]
pull_request:
branches: ["main"]
schedule: - cron: "0 0 \* \* 0" # Weekly on Sunday at midnight UTC
workflow_dispatch:

permissions:
contents: read
security-events: write
actions: read

concurrency:
group: ${{ github.workflow }}-${{ github.ref }}
cancel-in-progress: false

jobs:
analyze:
name: Analyze (${{ matrix.language }})
runs-on: ubuntu-24.04-arm
timeout-minutes: 30

    strategy:
      fail-fast: false
      matrix:
        language: ["javascript-typescript"]

    steps:
      - name: Wait in Queue
        uses: softprops/turnstyle@v3
        with:
          poll-interval-seconds: 30
          same-branch-only: false
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v6
        with:
          run_install: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "22.14.0"
          cache: "pnpm"

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{matrix.language}}"
