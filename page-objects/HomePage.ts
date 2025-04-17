import { Page, Locator } from '@playwright/test';
import { ProductDetailsPage } from './ProductDetailsPage';

export class HomePage {
  readonly page: Page;
  private readonly hotSellersSection: Locator;
  private readonly hotSellersProducts: Locator;
  // DRY selector for product link
  private readonly productItemLinkSelector = '.product-item-link';

  constructor(page: Page) {
    this.page = page;
    // Locate the Hot Sellers section by accessible role and name
    this.hotSellersSection = page.getByRole('heading', { name: 'Hot Sellers' });
    // Use a more direct approach to locate product items on the page
    this.hotSellersProducts = page.locator('.product-items .product-item');
  }

  /** Navigate to home, using baseURL from config */
  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  /** Returns the locator for the Hot Sellers section */
  getHotSellersSection(): Locator {
    return this.hotSellersSection;
  }

  /** Returns the number of products in the Hot Sellers section */
  async getHotSellersCount(): Promise<number> {
    return await this.hotSellersProducts.count();
  }

  /** Private helper to locate a product by index */
  private productAt(index: number): Locator {
    return this.hotSellersProducts.nth(index);
  }

  /** Get product name text at index */
  async getProductName(index: number): Promise<string | null> {
    const nameText = await this.productAt(index)
      .locator(this.productItemLinkSelector)
      .textContent();
    return nameText?.trim() ?? null;
  }

  /** Get product link URL at index */
  async getProductLink(index: number): Promise<string | null> {
    return await this.productAt(index)
      .locator(this.productItemLinkSelector)
      .getAttribute('href');
  }

  /** Clicks product at index and returns ProductDetailsPage */
  async clickProduct(index: number): Promise<ProductDetailsPage> {
    await this.productAt(index).locator(this.productItemLinkSelector).click();
    return new ProductDetailsPage(this.page);
  }

  /** Private: image locator for a product at the given index */
  private productImageAt(index: number): Locator {
    return this.productAt(index).locator('img');
  }

  /** Private: name link locator for a product at the given index */
  private productNameAt(index: number): Locator {
    return this.productAt(index).locator(this.productItemLinkSelector);
  }

  /** Private: price locator for a product at the given index */
  private productPriceAt(index: number): Locator {
    return this.productAt(index).locator('.price');
  }

  /** Private: 'Add to Cart' button locator for a product at the given index */
  private addToCartButtonAt(index: number): Locator {
    return this.productAt(index).locator("button:has-text('Add to Cart')");
  }

  /** Returns name and link of a product at the given index */
  async productDetails(
    index: number
  ): Promise<{ name: string | null; link: string | null }> {
    const name = await this.getProductName(index);
    const link = await this.getProductLink(index);
    return { name, link };
  }

  // Public getters for locator-based assertions
  /** Returns image locator for a product at the given index */
  public getProductImageAt(index: number): Locator {
    return this.productImageAt(index);
  }

  /** Returns name link locator for a product at the given index */
  public getProductNameAt(index: number): Locator {
    return this.productNameAt(index);
  }

  /** Returns price locator for a product at the given index */
  public getProductPriceAt(index: number): Locator {
    return this.productPriceAt(index);
  }

  /** Returns 'Add to Cart' button locator for a product at the given index */
  public getAddToCartButtonAt(index: number): Locator {
    return this.addToCartButtonAt(index);
  }
}
