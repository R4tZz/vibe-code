import { test as base, type Page } from '@playwright/test';
import { HomePage } from '../../page-objects/HomePage';

// Define the fixture type with all your page objects
type Pages = {
  homePage: HomePage;
  // Add other page objects here as your app grows
  // examplePage: ExamplePage;
};

// Create a custom fixture that provides all page objects
export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    // Create and navigate using HomePage
    const homePage = new HomePage(page);
    await homePage.goto();
    await use(homePage);
  },
  // Add more page fixtures following the same pattern
  // examplePage: async ({ page }, use) => {
  //   await use(new ExamplePage(page));
  // },
});

// Re-export expect for convenience
export { expect } from '@playwright/test';
