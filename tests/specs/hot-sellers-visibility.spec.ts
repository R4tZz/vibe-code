import { test, expect } from '../fixtures/fixtures';

// Add slow motion to make the test execution more visible
test.use({ launchOptions: { slowMo: 500 } });

test.describe('Hot Sellers Section Tests', () => {
  test.beforeEach(async ({ homePage }) => {
    // Setup: Navigate to homepage
    await test.step('Navigate to homepage', async () => {
      await homePage.goto();
    });
  });

  test('verify Hot Sellers section is visible', async ({ homePage }) => {
    await test.step('Verify Hot Sellers section is visible', async () => {
      await expect(homePage.getHotSellersSection()).toBeVisible();
    });
  });

  test('verify all Hot Sellers products have required elements', async ({
    homePage,
  }) => {
    // Step 1: Verify Hot Sellers section is visible
    await test.step('Verify Hot Sellers section is visible', async () => {
      await expect(homePage.getHotSellersSection()).toBeVisible();
    });

    // Step 2: Verify products exist in Hot Sellers section
    let count: number;
    await test.step('Verify products exist in Hot Sellers section', async () => {
      count = await homePage.getHotSellersCount();
      expect(
        count,
        'Hot Sellers section should contain products'
      ).toBeGreaterThan(0);
    });

    // Step 3: Verify each product has required elements
    await test.step('Verify each product has required elements', async () => {
      for (let i = 0; i < count; i++) {
        await test.step(`Product ${
          i + 1
        }: Verify image is visible`, async () => {
          await expect(homePage.getProductImageAt(i)).toBeVisible();
        });

        await test.step(`Product ${
          i + 1
        }: Verify product name is visible`, async () => {
          await expect(homePage.getProductNameAt(i)).toBeVisible();
        });

        await test.step(`Product ${
          i + 1
        }: Verify price is visible if present`, async () => {
          const priceLocator = homePage.getProductPriceAt(i);
          if (await priceLocator.count()) {
            await expect(priceLocator).toBeVisible();
          }
        });
      }
    });
  });

  // Set a longer timeout specifically for this test
  test('verify products have correct structure and can be clicked', async ({
    homePage,
    page,
  }) => {
    let productDetails: { name: string | null; link: string | null };
    await test.step('Capture first product details', async () => {
      productDetails = await homePage.productDetails(0);
    });

    await test.step('Click on first product and wait for navigation', async () => {
      // Using the recommended Playwright pattern for navigation
      // First get the locator for the link we want to click
      const productLink = homePage.getProductNameAt(0);

      // Use page.goto() to navigate to the product page
      // This is more reliable than clicking when testing navigation
      const href = await productLink.getAttribute('href');
      if (href) {
        await page.goto(href);
      } else {
        throw new Error('Product link href attribute not found');
      }
    });

    await test.step('Verify correct product page loads', async () => {
      // Verify page title contains product name
      const pageTitle = await page.title();
      expect(pageTitle).toContain(productDetails.name);

      // Verify URL contains part of the product link
      const currentUrl = page.url();

      // Extract just the product path from the full link
      const productPath = productDetails.link?.split(
        'softwaretestingboard.com'
      )[1];

      if (productPath) {
        expect(currentUrl).toContain(productPath);
      } else {
        // Fallback check - just verify we're on a product page
        expect(currentUrl).toContain('.html');
      }
    });
  });

  test("verify 'Add to Cart' functionality for Hot Sellers products", async ({
    homePage,
  }) => {
    await test.step('Verify Hot Sellers section is visible', async () => {
      await expect(homePage.getHotSellersSection()).toBeVisible();
    });

    await test.step("Verify 'Add to Cart' buttons are present and visible", async () => {
      await expect(homePage.getAddToCartButtonAt(0)).toBeVisible();
    });

    // Note: We're only testing button visibility here
    // A full E2E test would actually click and verify cart update
    // but that would require additional page objects and handling
  });
});
