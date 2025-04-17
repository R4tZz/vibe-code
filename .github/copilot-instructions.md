# Playwright Code Style Guide & Best Practices

## Introduction

This guide outlines best practices for writing maintainable, robust, and readable end-to-end tests using Playwright. It emphasizes the use of the Page Object Model (POM) design pattern and custom fixtures to promote code reuse and separation of concerns. Adhering to these practices will help ensure your test suite is scalable and easy to manage.

This guide reflects practices recommended in the official Playwright documentation. Always refer to the [latest Playwright documentation](https://playwright.dev/docs/intro) for the most up-to-date information.

## Table of Contents

1.  [Recommended Folder Structure](#recommended-folder-structure)
2.  [General Best Practices](#general-best-practices)
3.  [Locators](#locators)
4.  [Page Object Model (POM)](#page-object-model-pom)
    - [Structure](#structure)
    - [Naming Conventions](#naming-conventions)
    - [Locators in POM](#locators-in-pom)
    - [Action Methods](#action-methods)
    - [Assertions](#assertions-in-pom)
    - [Example](#pom-example)
5.  [Custom Fixtures](#custom-fixtures)
    - [Purpose](#purpose)
    - [Creating Fixtures](#creating-fixtures)
    - [Using Fixtures](#using-fixtures)
    - [Scope](#scope)
    - [Example](#fixture-example)
6.  [Assertions](#assertions)
7.  [Waiting Mechanisms](#waiting-mechanisms)
8.  [Test Structure and Naming](#test-structure-and-naming)
9.  [Configuration (`playwright.config.ts`)](#configuration-playwrightconfigts)
10. [Miscellaneous](#miscellaneous)

## Recommended Folder Structure

A well-organized folder structure is crucial for maintainability as your test suite grows. Here's a recommended structure that aligns with POM and fixture usage:

```
your-project-root/
├── .env                # Environment variables (add to .gitignore)
├── .gitignore          # Git ignore file
├── package.json        # Project dependencies and scripts
├── playwright.config.ts # Playwright configuration file
├── tests/              # Root directory for test specifications
│   ├── fixtures/       # Custom fixtures definitions (or a single fixtures.ts here)
│   │   └── fixtures.ts
│   ├── specs/          # Actual test files (can be further nested by feature)
│   │   ├── auth/       # Tests related to authentication
│   │   │   └── login.spec.ts
│   │   ├── shopping_cart/ # Tests for shopping cart feature
│   │   │   └── cart.spec.ts
│   │   └── product_search.spec.ts
│   └── example.spec.ts # Default Playwright example test (can be removed)
├── page-objects/       # Directory for Page Object Model classes
│   ├── components/     # Reusable UI components (e.g., header, footer, modals)
│   │   └── HeaderComponent.ts
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── ProductDetailsPage.ts
├── test-data/          # Optional: Directory for test data files (e.g., JSON, CSV)
│   └── users.json
├── utils/              # Optional: For reusable helper functions (not POMs or fixtures)
│   └── api-helpers.ts
└── test-results/       # Default output for reports, traces, screenshots (add to .gitignore)
    └── ...             # Generated content
```

**Explanation:**

- **`playwright.config.ts`**: The main configuration file at the root.
- **`tests/`**: Contains all test-related code.
  - **`fixtures/`** (or `tests/fixtures.ts`): Houses custom fixture definitions, keeping setup logic separate.
  - **`specs/`** (or directly under `tests/`): Contains the actual test files (`*.spec.ts`). Grouping tests by feature (e.g., `auth/`, `shopping_cart/`) within this directory is highly recommended for larger projects. The `testDir` option in `playwright.config.ts` should point here (e.g., `testDir: './tests/specs'`).
- **`page-objects/`**: Contains all POM classes.
  - **`components/`**: A sub-directory within `page-objects` for POM classes representing reusable components shared across multiple pages (like navigation bars, modals, etc.).
- **`test-data/`**: An optional directory to store static data used by tests.
- **`utils/`** or **`helpers/`**: Optional directory for generic helper functions that don't belong in a specific Page Object or fixture (e.g., data generators, specific API interaction helpers).
- **`.env`**: Store environment variables like base URLs, usernames, passwords. **Ensure this is added to `.gitignore`**.
- **`test-results/`**: Playwright's default output directory. **Ensure this is added to `.gitignore`**.

This structure promotes separation of concerns and makes it easier to navigate and maintain the test suite. Adjust the naming and nesting according to your project's specific needs and scale.

## General Best Practices

- **Keep Tests Independent:** Each test should run independently without relying on the state left by previous tests. Use `test.beforeEach` or fixtures for setup and `test.afterEach` for cleanup if necessary.
- **Use `test.describe` for Grouping:** Group related tests using `test.describe()` for better organization and reporting (aligns well with the folder structure under `tests/specs/`).
- **Avoid `page.waitForTimeout()`:** Do not use hard-coded waits. Rely on Playwright's auto-waiting mechanisms and web-first assertions. Use `page.waitForTimeout()` only for debugging purposes or very specific scenarios where other waits are unsuitable (which is rare).
- **Prefer Async/Await:** Use `async`/`await` consistently for all Playwright operations.

## Locators

- **Prefer User-Facing Locators:** Prioritize locators that users can see and interact with. Playwright's recommended order:
  1.  `page.getByRole()`: Locates by ARIA role, attributes, and accessible name. Most resilient.
  2.  `page.getByText()`: Locates by text content.
  3.  `page.getByLabel()`: Locates form controls by associated label text.
  4.  `page.getByPlaceholder()`: Locates inputs by placeholder.
  5.  `page.getByAltText()`: Locates elements (usually images) by `alt` text.
  6.  `page.getByTitle()`: Locates elements by title attribute.
  7.  `page.getByTestId()`: Locates by `data-testid` attribute (configurable via `testIdAttribute` in config). Use this when semantic locators aren't feasible.
- **Avoid XPath and CSS Selectors When Possible:** These are less resilient to DOM changes compared to user-facing locators. Use them as a last resort.
- **Use Locator Chaining/Filtering:** Refine locators using methods like `.filter()`, `.first()`, `.last()`, `.nth()`.

  ```typescript
  // Good: Filter by text within a role
  page.getByRole("listitem").filter({ hasText: "Product Name" });

  // Good: Get the first button
  page.getByRole("button").first();
  ```

## Page Object Model (POM)

POM is a design pattern that encapsulates interactions with the UI of a specific page or component into a dedicated class. This separates test logic from UI interaction details.

### Structure

- Create a separate file for each page or significant reusable component (e.g., `HomePage.ts`, `LoginPage.ts`, `ShoppingCartComponent.ts`) within the `page-objects/` directory.
- The class should encapsulate locators and methods specific to that page/component.

### Naming Conventions

- **Files:** Use PascalCase ending with `Page` or `Component` (e.g., `ProductDetailsPage.ts`). Place them in the `page-objects/` directory or subdirectories.
- **Classes:** Use PascalCase matching the file name (e.g., `ProductDetailsPage`).
- **Methods:** Use camelCase describing the user action (e.g., `MapsTo`, `login`, `addProductToCart`).

### Locators in POM

- Define locators as `readonly` properties within the class, typically initialized in the constructor or as class fields.
- Keep locators `private` or `protected` if they are only used internally by the POM's methods. Expose them publicly only if absolutely necessary for complex assertions in the test file.
- Use the `page` or a `locator` instance passed to the constructor.

```typescript
// page-objects/LoginPage.ts
import { type Page, type Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  readonly errorMessage: Locator; // May need to be public for assertions

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByLabel("Username");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.getByRole("button", { name: "Log in" });
    this.errorMessage = page.locator(".error-message"); // Example using CSS if needed
  }

  // ... action methods
}
```

### Action Methods

- Create public methods that represent user actions or workflows on the page (e.g., `login(username, password)`, `search(query)`, `MapsToProfile()`).
- Methods should perform actions using the defined locators.
- Methods performing navigation should typically return an instance of the _next_ Page Object.
- Methods performing actions on the same page usually return `void` or `this` (for chaining if desired, though less common in modern Playwright).

```typescript
// page-objects/LoginPage.ts
import { type Page, type Locator } from "@playwright/test";
import { DashboardPage } from "./DashboardPage"; // Import next page

export class LoginPage {
  // ... (constructor and locators as above)

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAndExpectSuccess(
    username: string,
    password: string
  ): Promise<DashboardPage> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    // Assuming successful login navigates to DashboardPage
    return new DashboardPage(this.page);
  }

  async navigateTo(): Promise<void> {
    // Assumes baseURL is set in playwright.config.ts
    await this.page.goto("/login");
  }
}
```

### Assertions in POM

- **Avoid Assertions:** Generally, avoid putting `expect` assertions within POM methods. POMs should focus on _actions_ and _locating elements_. Assertions belong in the test files (`tests/specs/**/*.spec.ts`) to define the expected outcomes.
- **Exception:** Simple, reusable assertions checking the state _of the page itself_ (e.g., `isErrorMessageVisible()`) _might_ be acceptable, but prefer keeping assertions in tests for clarity.

### POM Example (`tests/specs/auth/login.spec.ts` using `LoginPage`)

```typescript
// tests/specs/auth/login.spec.ts
import { test, expect } from "../../fixtures/fixtures"; // Import custom test if using fixtures
import { LoginPage } from "../../../page-objects/LoginPage";
import { DashboardPage } from "../../../page-objects/DashboardPage";

// If not using fixtures for POM initialization:
// import { test, expect } from '@playwright/test';

test.describe("Login Functionality", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    // Initialize POM here if not using a fixture
    loginPage = new LoginPage(page);
    await loginPage.navigateTo();
  });

  test("should allow login with valid credentials", async ({ page }) => {
    // ACT
    const dashboardPage = await loginPage.loginAndExpectSuccess(
      "validUser",
      "validPassword"
    );

    // ASSERT
    // Assertion using a locator/method from the *next* page object
    await expect(dashboardPage.welcomeMessage).toBeVisible(); // Assuming DashboardPage has welcomeMessage locator
    await expect(page).toHaveURL(/.*dashboard/); // Or use dashboardPage.expectToBeOnPage();
  });

  test("should show error message with invalid credentials", async ({
    page,
  }) => {
    // ACT
    await loginPage.login("invalidUser", "wrongPassword");

    // ASSERT
    // Assertion using a locator from the *current* page object
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText(
      "Invalid username or password"
    );
  });
});
```

## Custom Fixtures

Fixtures provide context for your tests, such as setting up environments, initializing POMs, or providing data. They help reduce boilerplate and improve test setup consistency. They typically reside in the `tests/fixtures/` directory.

### Purpose

- **Setup/Teardown:** Perform actions before (and optionally after) tests or workers run (e.g., log in a user, seed a database, start a server).
- **Provide Context:** Pass pre-configured objects like authenticated pages, API clients, or initialized Page Objects directly to tests.
- **Parameterization:** Run tests with different configurations or data sets.

### Creating Fixtures

- Define fixtures by extending the `base` test object from `@playwright/test`.
- Place fixture definitions in `tests/fixtures/fixtures.ts` (or similar).
- A fixture function takes dependencies (like `page`, `browser`, other fixtures) and uses the `use` function to provide the fixture value.

```typescript
// tests/fixtures/fixtures.ts
import { test as base, expect } from "@playwright/test"; // Import expect here too
import { LoginPage } from "../../page-objects/LoginPage";
import { DashboardPage } from "../../page-objects/DashboardPage";

// Define the types for your fixtures
type MyFixtures = {
  loginPage: LoginPage;
  loggedInPage: Page; // Example: A page already logged in
  dashboardPage: DashboardPage;
};

// Extend the base test with your fixtures
export const test = base.extend<MyFixtures>({
  // Fixture to provide an initialized LoginPage instance
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo(); // Optional: Navigate automatically
    await use(loginPage);
    // Add cleanup if needed after 'use'
  },

  // Fixture to provide a page instance that is already logged in
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateTo();
    await loginPage.login("fixtureUser", "fixturePassword");
    // Ensure login was successful (e.g., wait for a dashboard element)
    await expect(
      page.getByRole("heading", { name: "Dashboard" })
    ).toBeVisible();
    await use(page);
    // Optional: Add logout logic here if needed for cleanup
  },

  // Fixture providing DashboardPage - depends on a logged-in state
  dashboardPage: async ({ loggedInPage }, use) => {
    // Use loggedInPage fixture which ensures user is logged in
    const dashboardPage = new DashboardPage(loggedInPage);
    await use(dashboardPage);
  },
});

// Re-export expect so tests import it from fixtures file
export { expect };
```

### Using Fixtures

- Import the custom `test` and `expect` objects from your fixtures file (`tests/fixtures/fixtures.ts`) in your spec files (`tests/specs/**/*.spec.ts`).
- Destructure the fixture names in the test function parameters.

```typescript
// tests/specs/dashboard/dashboard.spec.ts
import { test, expect } from "../../fixtures/fixtures"; // Import custom test and expect

test.describe("Dashboard Tests (using fixtures)", () => {
  // Test using the loggedInPage and dashboardPage fixtures
  test("should display welcome message", async ({ dashboardPage }) => {
    // ARRANGE is handled by the fixture

    // ACT (Optional, if further action needed)

    // ASSERT
    await expect(dashboardPage.welcomeMessage).toContainText("Welcome");
  });

  // Test using the loginPage fixture (less common if loggedInPage exists, but possible)
  test("should allow navigation from login page", async ({
    loginPage,
    page,
  }) => {
    // ARRANGE (partially done by fixture - loginPage is initialized and navigated)

    // ACT
    const dashboardPage = await loginPage.loginAndExpectSuccess("user", "pass");

    // ASSERT
    await expect(dashboardPage.welcomeMessage).toBeVisible();
    await expect(page).toHaveURL(/.*dashboard/);
  });
});
```

### Scope

- **`test` (default):** The fixture setup/teardown runs for _each_ test function.
- **`worker`:** The fixture setup/teardown runs _once per worker process_. Useful for expensive setups like logging in once for multiple tests run by the same worker. Use `scope: 'worker'` in the fixture definition.

```typescript
// tests/fixtures/fixtures.ts
// ...
export const test = base.extend<MyFixtures & { workerScopedData: string }>({
  // ... other fixtures

  workerScopedData: [
    async ({}, use) => {
      // Setup runs once per worker
      const data = await initializeSomethingExpensive();
      await use(data);
      // Teardown runs once per worker after all tests in that worker finish
      await cleanupSomethingExpensive(data);
    },
    { scope: "worker" },
  ], // Set scope to worker
});
// ...
```

### Fixture Example

See `tests/fixtures/fixtures.ts` and `tests/specs/dashboard/dashboard.spec.ts` above.

## Assertions

- **Use Web-First Assertions:** Always prefer `expect(locator)` assertions (e.g., `expect(locator).toBeVisible()`, `expect(locator).toHaveText()`). They automatically wait for the condition to be met within the configured timeout.
- **Avoid `expect(await locator.isVisible())`:** This creates race conditions as the element state might change between the `isVisible()` call and the assertion.
- **Common Assertions:**
  - `expect(locator).toBeVisible()` / `.toBeHidden()`
  - `expect(locator).toBeEnabled()` / `.toBeDisabled()`
  - `expect(locator).toHaveText()` / `.toContainText()`
  - `expect(locator).toHaveAttribute()`
  - `expect(locator).toHaveValue()`
  - `expect(locator).toHaveCount()`
  - `expect(locator).toBeChecked()`
  - `expect(page).toHaveURL()`
  - `expect(page).toHaveTitle()`
  - `expect(apiResponse).toBeOK()` (for API testing)
- **Keep Assertions in Test Files:** As mentioned in the POM section, test files (`tests/specs/**/*.spec.ts`) are the primary place for assertions.

## Waiting Mechanisms

- **Rely on Auto-Waiting:** Playwright actions (like `.click()`, `.fill()`) and web-first assertions (`expect(locator)...`) have built-in auto-waiting. Use them primarily.
- **Explicit Waits (Use Sparingly):**
  - `page.waitForURL()`: Wait for the page URL to match a pattern.
  - `page.waitForSelector()`: (Less recommended) Wait for an element matching the selector. Prefer `expect(locator).toBeVisible()`.
  - `page.waitForResponse()`: Wait for a specific network response.
  - `page.waitForLoadState()`: Wait for 'load', 'domcontentloaded', or 'networkidle'. Use 'networkidle' cautiously.
  - `expect(locator).toBeVisible({ timeout: 10000 })`: Override default timeout for a specific assertion.

## Test Structure and Naming

- **Arrange-Act-Assert (AAA):** Structure your tests clearly:
  1.  **Arrange:** Set up preconditions (often handled by `beforeEach` or fixtures).
  2.  **Act:** Perform the action(s) being tested (usually calls to POM methods).
  3.  **Assert:** Verify the outcome using `expect`.
- **Descriptive Names:**
  - `test.describe()`: Describe the feature or component being tested (e.g., `'Login Page'`, `'Shopping Cart'`). Aligns with folder names under `tests/specs/`.
  - `test()`: Describe the specific scenario or expected outcome (e.g., `'should display error on invalid login'`, `'should allow adding items to cart'`).

## Configuration (`playwright.config.ts`)

- **`testDir`:** Specify the directory where test specification files are located (e.g., `./tests/specs`).
- **`outputDir`:** Define where test results like traces, screenshots, and videos are stored (e.g., `./test-results`).
- **`baseURL`:** Define a base URL to simplify navigation (`page.goto('/login')`).
- **`timeout`:** Set the global timeout for each test.
- **`expect.timeout`:** Set the default timeout for `expect` assertions. Keep it reasonably short but sufficient for elements to appear.
- **`use`:** Configure browser context options globally or per project (e.g., `viewport`, `headless`, `screenshot`, `trace`, `video`, `permissions`).
- **`projects`:** Define configurations for different browsers (Chromium, Firefox, WebKit) or setups (e.g., mobile emulation, different authentication states).
- **`reporter`:** Configure test reporters (e.g., `html`, `list`, `json`). The HTML reporter is excellent for debugging.
- **`fullyParallel`: `true`** is recommended for faster execution by running files in parallel.
- **`forbidOnly`: `true`** in CI environments prevents accidentally committing focused tests (`test.only`).
- **`retries`:** Configure retries for flaky tests (e.g., `1` or `2` in CI).

## Miscellaneous

- **Environment Variables:** Use environment variables (`.env` files with `dotenv`) for sensitive data (credentials) and environment-specific configurations (like `baseURL`). Access them via `process.env`. Store `.env` at the project root and add it to `.gitignore`.
- **Playwright Codegen:** Use `npx playwright codegen <url>` as a tool to help discover locators or record basic interactions, but always review and refine the generated code to follow best practices (especially locator strategy).
- **API Testing:** Leverage Playwright's `request` context (`playwright.request`) for API testing or for setting up application state via API calls before UI interaction. Create API client wrappers (potentially in `utils/`) similar to POMs.
- **Tracing:** Enable tracing (`trace: 'on'` or `'retain-on-failure'` in config) for debugging. The trace viewer provides invaluable insights into test execution failures.
- **Keep Tests Focused:** Each test should ideally verify one specific piece of functionality or requirement. Avoid overly long or complex tests trying to cover too much.
