# vibe-code
Playwright end-to-end tests for Vibe Code project

## Prerequisites

- Node.js (v16+)
- npm (v8+)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/R4tZz/vibe-code.git
   cd vibe-code
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Available Scripts

- `npm test` – Run all end‑to‑end tests with Playwright
- `npm run test:ci` – Run tests in CI mode (list reporter, parallelism)
- `npm run mcp-server` – Launch Playwright MCP server (for IDE integration)

## Project Structure

```plaintext
vibe-code/
├── page-objects/       # Playwright Page Object Model classes
├── tests/
│   ├── fixtures/       # Custom Playwright fixtures
│   └── specs/          # Test specification files (*.spec.ts)
├── playwright.config.ts # Playwright test configuration
├── test-results/       # Test output (screenshots, videos, traces)
├── playwright-report/  # HTML report (after running tests)
└── utils/              # Optional helper modules
```

## Running Tests

```bash
npm test
# or with CI settings
npm run test:ci
```

## Reporting

- HTML report is generated in `playwright-report` (open `index.html`)
- Test artifacts (screenshots, videos, traces) are stored in `test-results`

## Contributing

Feel free to open issues or pull requests to improve test coverage and code quality.
