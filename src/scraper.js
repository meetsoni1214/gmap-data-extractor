import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { CONFIG, buildGoogleMapsSearchUrl, getRandomUserAgent } from './config.js';
import { log, delay, waitForElement } from './utils.js';

puppeteer.use(StealthPlugin());

export class GoogleMapsScraper {
  constructor(options = {}) {
    this.headless = options.headless ?? CONFIG.browser.headless;
    this.maxResults = options.maxResults || null;
    this.timeout = options.timeout || CONFIG.timeouts.element;
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    log('Launching browser...');
    
    this.browser = await puppeteer.launch({
      headless: this.headless,
      defaultViewport: CONFIG.browser.defaultViewport,
      args: CONFIG.browser.args
    });

    this.page = await this.browser.newPage();
    
    await this.page.setUserAgent(getRandomUserAgent());
    
    await this.page.setDefaultNavigationTimeout(CONFIG.timeouts.navigation);
    await this.page.setDefaultTimeout(this.timeout);

    log('Browser launched successfully', 'success');
  }

  async searchGoogleMaps(query) {
    const url = buildGoogleMapsSearchUrl(query);
    log(`Navigating to Google Maps: ${query}`);

    try {
      await this.page.goto(url, { waitUntil: 'networkidle2' });
      await delay(2000);

      const resultsFound = await waitForElement(
        this.page,
        CONFIG.selectors.searchResultsPanel,
        10000
      );

      if (!resultsFound) {
        throw new Error('Search results panel not found');
      }

      log('Search results loaded', 'success');
      return true;
    } catch (error) {
      log(`Failed to load search results: ${error.message}`, 'error');
      return false;
    }
  }

  async scrollToLoadAllResults() {
    log('Scrolling to load all results...');
    
    const resultsPanel = await this.page.$(CONFIG.selectors.searchResultsPanel);
    if (!resultsPanel) {
      log('Results panel not found', 'error');
      return 0;
    }

    let previousResultCount = 0;
    let noNewResultsCount = 0;
    let scrollAttempts = 0;

    while (scrollAttempts < CONFIG.scrolling.maxScrollAttempts) {
      const currentResultCount = await this.page.evaluate((selector) => {
        return document.querySelectorAll(selector).length;
      }, CONFIG.selectors.businessCard);

      if (this.maxResults && currentResultCount >= this.maxResults) {
        log(`Reached max results limit: ${this.maxResults}`, 'info');
        break;
      }

      if (currentResultCount === previousResultCount) {
        noNewResultsCount++;
        if (noNewResultsCount >= CONFIG.scrolling.noNewResultsThreshold) {
          log('No new results found after multiple scrolls', 'info');
          break;
        }
      } else {
        noNewResultsCount = 0;
        log(`Found ${currentResultCount} results so far...`);
      }

      await this.page.evaluate((selector, scrollAmount) => {
        const panel = document.querySelector(selector);
        if (panel) {
          panel.scrollBy(0, scrollAmount);
        }
      }, CONFIG.selectors.searchResultsPanel, CONFIG.scrolling.scrollAmount);

      await delay(CONFIG.timeouts.scrollDelay);

      previousResultCount = currentResultCount;
      scrollAttempts++;
    }

    const finalCount = await this.page.evaluate((selector) => {
      return document.querySelectorAll(selector).length;
    }, CONFIG.selectors.businessCard);

    log(`Total results found: ${finalCount}`, 'success');
    return finalCount;
  }

  async extractBusinessLinks() {
    log('Extracting business links...');

    try {
      const links = await this.page.evaluate((cardSelector, linkSelector) => {
        const cards = document.querySelectorAll(cardSelector);
        const extractedLinks = [];

        cards.forEach(card => {
          const link = card.querySelector(linkSelector);
          if (link && link.href) {
            extractedLinks.push(link.href);
          }
        });

        return extractedLinks;
      }, CONFIG.selectors.businessCard, CONFIG.selectors.businessLink);

      const limitedLinks = this.maxResults 
        ? links.slice(0, this.maxResults) 
        : links;

      log(`Extracted ${limitedLinks.length} business links`, 'success');
      return limitedLinks;
    } catch (error) {
      log(`Error extracting business links: ${error.message}`, 'error');
      return [];
    }
  }

  async clickBusinessByIndex(index) {
    try {
      await this.page.evaluate((cardSelector, linkSelector, idx) => {
        const cards = document.querySelectorAll(cardSelector);
        if (cards[idx]) {
          const link = cards[idx].querySelector(linkSelector);
          if (link) {
            link.click();
          }
        }
      }, CONFIG.selectors.businessCard, CONFIG.selectors.businessLink, index);

      await delay(CONFIG.timeouts.businessDetailLoad);
      return true;
    } catch (error) {
      log(`Error clicking business at index ${index}: ${error.message}`, 'error');
      return false;
    }
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async getPageContent() {
    return this.page.content();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      log('Browser closed', 'info');
    }
  }

  async executeWithRetry(fn, maxAttempts = CONFIG.retry.maxAttempts) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxAttempts) {
          throw error;
        }
        log(`Attempt ${attempt} failed, retrying...`, 'warning');
        await delay(CONFIG.retry.delayMs);
      }
    }
  }
}
