# Google Maps Data Extractor

A powerful Node.js CLI tool to extract detailed business information from Google Maps search results. Simply provide a search query like "Computer dealers in Ahmedabad" and get all business listings with comprehensive details exported to CSV or JSON format.

## Features

- 🔍 **Simple Search**: Extract data with a single query
- 🤖 **Automated Scrolling**: Automatically loads all available results
- 📊 **Detailed Data**: Extracts name, address, phone, website, ratings, reviews, hours, and more
- 📁 **Multiple Formats**: Export to CSV, JSON, or both
- 📈 **Progress Tracking**: Real-time progress bar with ETA
- 🔄 **Retry Logic**: Automatic retry for failed extractions
- 🛡️ **Error Handling**: Comprehensive error logging and reporting
- 🎭 **Stealth Mode**: Anti-bot detection measures built-in

## Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

## Usage

### Basic Usage

Extract data from a Google Maps search query:

```bash
node src/index.js "Computer dealers in Ahmedabad"
```

### Advanced Usage

#### Custom Output Filename

```bash
node src/index.js "Restaurants in Mumbai" --output restaurants.csv
```

#### Limit Number of Results

```bash
node src/index.js "Hotels in Delhi" --max-results 50
```

#### Export to JSON

```bash
node src/index.js "Cafes in Bangalore" --format json
```

#### Export to Both CSV and JSON

```bash
node src/index.js "Gyms near me" --format both
```

#### Run Browser in Visible Mode (Non-Headless)

```bash
node src/index.js "Car dealers in Chennai" --headless false
```

#### Custom Timeout

```bash
node src/index.js "Pharmacies in Pune" --timeout 15000
```

### All Available Options

| Option                    | Description                       | Default        |
| ------------------------- | --------------------------------- | -------------- |
| `-o, --output <filename>` | Custom output filename            | Auto-generated |
| `--headless <boolean>`    | Run browser in headless mode      | `true`         |
| `--timeout <ms>`          | Max wait time per business (ms)   | `10000`        |
| `--max-results <number>`  | Limit number of results           | Unlimited      |
| `--format <type>`         | Output format: csv, json, or both | `csv`          |

## Extracted Data Fields

For each business listing, the tool extracts:

- **Business Name**
- **Category** (e.g., Computer Store, Restaurant)
- **Full Address**
- **Phone Number**
- **Website URL**
- **Rating** (out of 5 stars)
- **Review Count**
- **Price Level** ($, $$, $$$, $$$$)
- **Business Hours**
- **Plus Code** (Google's location code)
- **Google Maps URL**

## Output

### CSV Output

Results are saved in the `output/` directory with auto-generated filenames:

```
output/computer_dealers_in_ahmedabad_2026-01-14T10-30-45.csv
```

### JSON Output

JSON files include metadata and structured results:

```json
{
  "query": "Computer dealers in Ahmedabad",
  "exportDate": "2026-01-14T10:30:45.123Z",
  "totalResults": 75,
  "results": [
    {
      "name": "ABC Computers",
      "category": "Computer Store",
      "address": "123 Main St, Ahmedabad",
      "phone": "+91 1234567890",
      "website": "https://example.com",
      "rating": 4.5,
      "reviewCount": 234,
      "priceLevel": "$$",
      "hours": "Open ⋅ Closes 8 PM",
      "plusCode": "7JMJ+XC Ahmedabad",
      "url": "https://maps.google.com/..."
    }
  ]
}
```

## Example Output

After running a search, you'll see:

```
🗺️  Google Maps Data Extractor

[10:30:45] ℹ Launching browser...
[10:30:47] ✓ Browser launched successfully
[10:30:47] ℹ Navigating to Google Maps: Computer dealers in Ahmedabad
[10:30:50] ✓ Search results loaded
[10:30:50] ℹ Scrolling to load all results...
[10:30:55] ℹ Found 50 results so far...
[10:31:00] ℹ Found 75 results so far...
[10:31:05] ✓ Total results found: 75
[10:31:05] ℹ Starting extraction of 75 businesses...
████████████████████████████████████████ | 100% | 75/75 businesses | ETA: 0s

✓ CSV file saved: output/computer_dealers_in_ahmedabad_2026-01-14T10-31-45.csv

==================================================
EXTRACTION SUMMARY
==================================================
Total Records Extracted: 73
Total Errors: 2
Success Rate: 97.33%

Field Completion Rates:
  name: 100.0%
  address: 98.6%
  phone: 89.0%
  website: 75.3%
  rating: 95.9%
  reviewCount: 95.9%
  category: 97.3%
  hours: 87.7%
  priceLevel: 45.2%
  plusCode: 82.2%
==================================================

✨ Extraction completed successfully!
```

## Error Handling

The tool includes robust error handling:

- **Automatic Retries**: Failed extractions are retried up to 3 times
- **Error Logging**: All errors are logged to `extraction_errors.log`
- **Error Reports**: Detailed error reports saved to `output/error_report.json`
- **Graceful Shutdown**: Press Ctrl+C to safely close the browser

## Project Structure

```
gmap-extractor/
├── package.json
├── README.md
├── .gitignore
├── src/
│   ├── index.js           # CLI entry point
│   ├── scraper.js         # Puppeteer automation
│   ├── extractor.js       # Data extraction logic
│   ├── csv-exporter.js    # CSV/JSON export
│   ├── error-handler.js   # Error handling & logging
│   ├── config.js          # Configuration & selectors
│   └── utils.js           # Helper functions
└── output/                # Generated files
```

## Troubleshooting

### Issue: "Search results panel not found"

**Solution**: The page may have taken longer to load. Try increasing the timeout:

```bash
node src/index.js "your query" --timeout 20000
```

### Issue: "No results found"

**Solution**:

- Check your search query for typos
- Try a broader search term
- Ensure you have an internet connection

### Issue: Browser not launching

**Solution**:

- Ensure all dependencies are installed: `npm install`
- Try running in non-headless mode: `--headless false`
- On Linux, you may need additional dependencies for Chrome

### Issue: Low data completion rates

**Solution**:

- Some businesses may not have all fields available on Google Maps
- Try increasing the timeout for better results: `--timeout 15000`
- Run in non-headless mode to see what's happening: `--headless false`

## Important Notes

### Legal & Ethical Considerations

⚠️ **Important**: This tool is intended for educational and personal use only.

- Respect Google's Terms of Service
- Do not use for commercial data reselling
- Implement rate limiting to avoid IP blocks
- Consider Google Maps API for commercial use cases

### Rate Limiting

To avoid being blocked:

- Don't run multiple instances simultaneously
- Add delays between searches
- Limit max results when testing
- Use a VPN if making many requests

### Maintenance

Google Maps' HTML structure may change over time, which could affect the tool's functionality. If you notice extraction failures:

1. Check the `extraction_errors.log` file
2. Selectors in `src/config.js` may need updating
3. Run in non-headless mode to inspect the page structure

## Performance Tips

- **Headless Mode**: Faster when running in headless mode (default)
- **Max Results**: Limit results for faster extraction during testing
- **Timeout**: Increase timeout for slower connections
- **Parallel Processing**: The tool processes sequentially for stability

## Contributing

Feel free to submit issues, suggestions, or pull requests to improve this tool.

## Disclaimer

This tool is not affiliated with Google. Use responsibly and in accordance with applicable laws and terms of service.
