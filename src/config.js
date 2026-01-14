export const CONFIG = {
  browser: {
    headless: true,
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  },

  timeouts: {
    navigation: 30000,
    element: 10000,
    scrollDelay: 2000,
    businessDetailLoad: 3000,
    betweenClicks: 1000
  },

  selectors: {
    searchResultsPanel: 'div[role="feed"]',
    businessCard: 'div[role="article"]',
    businessLink: 'a[href*="/maps/place/"]',
    businessName: 'h1.DUwDvf',
    businessAddress: 'button[data-item-id="address"]',
    businessPhone: 'button[data-item-id*="phone"]',
    businessWebsite: 'a[data-item-id="authority"]',
    businessRating: 'div.F7nice span[aria-label*="stars"]',
    businessReviewCount: 'div.F7nice span[aria-label*="reviews"]',
    businessCategory: 'button[jsaction*="category"]',
    businessHours: 'button[data-item-id="oh"]',
    businessPriceLevel: 'span[aria-label*="Price"]',
    businessPlusCode: 'button[data-item-id="oloc"]',
    detailsPanel: 'div[aria-label*="Information"]',
    closeButton: 'button[aria-label*="Close"]'
  },

  scrolling: {
    maxScrollAttempts: 50,
    scrollAmount: 1000,
    noNewResultsThreshold: 3
  },

  retry: {
    maxAttempts: 3,
    delayMs: 2000
  },

  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ],

  export: {
    outputDir: 'output',
    dateFormat: 'YYYY-MM-DD_HHmmss'
  }
};

export function getRandomUserAgent() {
  return CONFIG.userAgents[Math.floor(Math.random() * CONFIG.userAgents.length)];
}

export function buildGoogleMapsSearchUrl(query) {
  const encodedQuery = encodeURIComponent(query);
  return `https://www.google.com/maps/search/${encodedQuery}`;
}
