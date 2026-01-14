import { CONFIG } from './config.js';
import { 
  safeGetText, 
  safeGetAttribute, 
  extractRatingValue, 
  extractReviewCount, 
  extractPriceLevel,
  formatBusinessHours,
  log,
  delay
} from './utils.js';

export class BusinessDataExtractor {
  constructor(page) {
    this.page = page;
  }

  async extractBusinessDetails(businessUrl, index = null) {
    try {
      const indexStr = index !== null ? ` (${index + 1})` : '';
      log(`Extracting details${indexStr}...`);

      await delay(1500);

      const name = await this.extractName();
      const address = await this.extractAddress();
      const phone = await this.extractPhone();
      const website = await this.extractWebsite();
      const rating = await this.extractRating();
      const reviewCount = await this.extractReviewCount();
      const category = await this.extractCategory();
      const hours = await this.extractBusinessHours();
      const priceLevel = await this.extractPriceLevel();
      const plusCode = await this.extractPlusCode();

      const business = {
        name: name || 'N/A',
        address: address || 'N/A',
        phone: phone || 'N/A',
        website: website || 'N/A',
        rating: rating || 'N/A',
        reviewCount: reviewCount || 'N/A',
        category: category || 'N/A',
        hours: hours || 'N/A',
        priceLevel: priceLevel || 'N/A',
        plusCode: plusCode || 'N/A',
        url: businessUrl || this.page.url()
      };

      return business;
    } catch (error) {
      log(`Error extracting business details: ${error.message}`, 'error');
      return null;
    }
  }

  async extractName() {
    try {
      let name = await safeGetText(this.page, CONFIG.selectors.businessName);
      
      if (!name) {
        name = await this.page.evaluate(() => {
          const h1 = document.querySelector('h1');
          return h1 ? h1.textContent?.trim() : null;
        });
      }

      return name;
    } catch (error) {
      return null;
    }
  }

  async extractAddress() {
    try {
      let address = await safeGetText(this.page, CONFIG.selectors.businessAddress);
      
      if (!address) {
        address = await this.page.evaluate(() => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const addressButton = buttons.find(btn => 
            btn.getAttribute('data-item-id') === 'address' ||
            btn.getAttribute('aria-label')?.includes('Address')
          );
          return addressButton ? addressButton.textContent?.trim() : null;
        });
      }

      return address;
    } catch (error) {
      return null;
    }
  }

  async extractPhone() {
    try {
      let phone = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const phoneButton = buttons.find(btn => 
          btn.getAttribute('data-item-id')?.includes('phone') ||
          btn.getAttribute('aria-label')?.includes('Phone')
        );
        return phoneButton ? phoneButton.textContent?.trim() : null;
      });

      return phone;
    } catch (error) {
      return null;
    }
  }

  async extractWebsite() {
    try {
      let website = await safeGetAttribute(this.page, CONFIG.selectors.businessWebsite, 'href');
      
      if (!website) {
        website = await this.page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a'));
          const websiteLink = links.find(link => 
            link.getAttribute('data-item-id') === 'authority' ||
            link.getAttribute('aria-label')?.includes('Website')
          );
          return websiteLink ? websiteLink.href : null;
        });
      }

      return website;
    } catch (error) {
      return null;
    }
  }

  async extractRating() {
    try {
      const ratingElement = await this.page.evaluate(() => {
        const ratingSpan = document.querySelector('div.F7nice span[aria-label]');
        if (ratingSpan) {
          return ratingSpan.getAttribute('aria-label');
        }

        const ratingDiv = document.querySelector('div[role="img"][aria-label*="stars"]');
        if (ratingDiv) {
          return ratingDiv.getAttribute('aria-label');
        }

        return null;
      });

      return extractRatingValue(ratingElement);
    } catch (error) {
      return null;
    }
  }

  async extractReviewCount() {
    try {
      const reviewElement = await this.page.evaluate(() => {
        const reviewSpan = Array.from(document.querySelectorAll('span')).find(span => 
          span.textContent?.includes('review') || 
          span.getAttribute('aria-label')?.includes('review')
        );
        return reviewSpan ? reviewSpan.textContent : null;
      });

      return extractReviewCount(reviewElement);
    } catch (error) {
      return null;
    }
  }

  async extractCategory() {
    try {
      const category = await this.page.evaluate(() => {
        const categoryButton = document.querySelector('button[jsaction*="category"]');
        if (categoryButton) {
          return categoryButton.textContent?.trim();
        }

        const categorySpan = Array.from(document.querySelectorAll('span')).find(span => {
          const text = span.textContent?.trim();
          return text && span.className && !text.includes('·') && text.length < 50;
        });

        return categorySpan ? categorySpan.textContent?.trim() : null;
      });

      return category;
    } catch (error) {
      return null;
    }
  }

  async extractBusinessHours() {
    try {
      const hours = await this.page.evaluate(() => {
        const hoursButton = document.querySelector('button[data-item-id="oh"]');
        if (hoursButton) {
          return hoursButton.getAttribute('aria-label') || hoursButton.textContent?.trim();
        }

        const hoursDiv = Array.from(document.querySelectorAll('div')).find(div =>
          div.getAttribute('aria-label')?.includes('Hours') ||
          div.textContent?.includes('Open') ||
          div.textContent?.includes('Closed')
        );

        return hoursDiv ? hoursDiv.textContent?.trim() : null;
      });

      return formatBusinessHours(hours);
    } catch (error) {
      return null;
    }
  }

  async extractPriceLevel() {
    try {
      const priceElement = await this.page.evaluate(() => {
        const priceSpan = document.querySelector('span[aria-label*="Price"]');
        if (priceSpan) {
          return priceSpan.getAttribute('aria-label');
        }

        const dollarSigns = Array.from(document.querySelectorAll('span')).find(span =>
          /^\$+$/.test(span.textContent?.trim() || '')
        );

        return dollarSigns ? dollarSigns.textContent?.trim() : null;
      });

      return extractPriceLevel(priceElement);
    } catch (error) {
      return null;
    }
  }

  async extractPlusCode() {
    try {
      const plusCode = await this.page.evaluate(() => {
        const plusCodeButton = document.querySelector('button[data-item-id="oloc"]');
        if (plusCodeButton) {
          return plusCodeButton.textContent?.trim();
        }

        const plusCodePattern = /[A-Z0-9]{4}\+[A-Z0-9]{2,}/;
        const allText = document.body.textContent || '';
        const match = allText.match(plusCodePattern);
        return match ? match[0] : null;
      });

      return plusCode;
    } catch (error) {
      return null;
    }
  }

  async extractMultipleBusinesses(businessCount, clickBusinessFn) {
    const businesses = [];
    const errors = [];

    for (let i = 0; i < businessCount; i++) {
      try {
        const clicked = await clickBusinessFn(i);
        
        if (!clicked) {
          errors.push({ index: i, error: 'Failed to click business' });
          continue;
        }

        const businessData = await this.extractBusinessDetails(null, i);
        
        if (businessData) {
          businesses.push(businessData);
        } else {
          errors.push({ index: i, error: 'Failed to extract data' });
        }

        await delay(CONFIG.timeouts.betweenClicks);
      } catch (error) {
        log(`Error processing business ${i + 1}: ${error.message}`, 'error');
        errors.push({ index: i, error: error.message });
      }
    }

    return { businesses, errors };
  }
}
