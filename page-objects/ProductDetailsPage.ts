import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailsPage {
  readonly page: Page;
  readonly productTitle: Locator;
  readonly addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    // Use accessible role to locate product title
    this.productTitle = page.getByRole('heading', { level: 1 });
    // DRY: locate Add to Cart button
    this.addToCartButton = page.getByRole('button', { name: 'Add to Cart' });
  }

  /** Returns the product title text */
  async getTitle(): Promise<string> {
    const title = await this.productTitle.textContent();
    return title?.trim() ?? '';
  }

  /** Clicks Add to Cart button */
  async addToCart(): Promise<void> {
    await this.addToCartButton.click();
  }

  /** Verifies that the page is loaded by checking the title is visible */
  async expectOnPage(): Promise<void> {
    await expect(this.productTitle).toBeVisible();
  }
}
