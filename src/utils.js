import chalk from 'chalk';

export function log(message, type = 'info') {
  const timestamp = new Date().toLocaleTimeString();
  
  switch (type) {
    case 'success':
      console.log(chalk.green(`[${timestamp}] ✓ ${message}`));
      break;
    case 'error':
      console.log(chalk.red(`[${timestamp}] ✗ ${message}`));
      break;
    case 'warning':
      console.log(chalk.yellow(`[${timestamp}] ⚠ ${message}`));
      break;
    case 'info':
    default:
      console.log(chalk.blue(`[${timestamp}] ℹ ${message}`));
      break;
  }
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function sanitizeFilename(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function generateOutputFilename(query, extension = 'csv') {
  const sanitized = sanitizeFilename(query);
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  return `${sanitized}_${timestamp}.${extension}`;
}

export async function waitForElement(page, selector, timeout = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    return false;
  }
}

export async function safeGetText(page, selector) {
  try {
    const element = await page.$(selector);
    if (!element) return null;
    return await page.evaluate(el => el.textContent?.trim() || null, element);
  } catch (error) {
    return null;
  }
}

export async function safeGetAttribute(page, selector, attribute) {
  try {
    const element = await page.$(selector);
    if (!element) return null;
    return await page.evaluate((el, attr) => el.getAttribute(attr), element, attribute);
  } catch (error) {
    return null;
  }
}

export function formatBusinessHours(hoursText) {
  if (!hoursText) return null;
  return hoursText.replace(/\s+/g, ' ').trim();
}

export function extractRatingValue(ratingText) {
  if (!ratingText) return null;
  const match = ratingText.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

export function extractReviewCount(reviewText) {
  if (!reviewText) return null;
  const match = reviewText.match(/(\d+(?:,\d+)*)/);
  return match ? parseInt(match[1].replace(/,/g, '')) : null;
}

export function extractPriceLevel(priceText) {
  if (!priceText) return null;
  const match = priceText.match(/(\$+)/);
  return match ? match[1] : null;
}

export function normalizeBusinessValue(value) {
  if (!value || value === 'N/A') return '';

  return String(value)
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[^a-z0-9]+/i, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function normalizePhoneValue(value) {
  if (!value || value === 'N/A') return '';

  return String(value).replace(/[^\d+]/g, '');
}

export function normalizeBusinessUrl(value) {
  if (!value || value === 'N/A') return '';

  try {
    const url = new URL(value);
    url.search = '';
    url.hash = '';
    return url.toString().toLowerCase();
  } catch (error) {
    return normalizeBusinessValue(value);
  }
}

export function getBusinessDedupeKey(business) {
  if (!business) return null;

  const name = normalizeBusinessValue(business.name);
  const address = normalizeBusinessValue(business.address);
  const phone = normalizePhoneValue(business.phone);
  const plusCode = normalizeBusinessValue(business.plusCode);
  const url = normalizeBusinessUrl(business.url);

  if (name && address) return `name-address:${name}|${address}`;
  if (name && phone) return `name-phone:${name}|${phone}`;
  if (name && plusCode) return `name-plus-code:${name}|${plusCode}`;
  if (url) return `url:${url}`;

  return null;
}

export function dedupeBusinesses(businesses) {
  const seen = new Set();
  const unique = [];
  const duplicates = [];

  businesses.forEach((business, index) => {
    const key = getBusinessDedupeKey(business);

    if (key && seen.has(key)) {
      duplicates.push({ index, business, key });
      return;
    }

    if (key) {
      seen.add(key);
    }

    unique.push(business);
  });

  return { unique, duplicates };
}

