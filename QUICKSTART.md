# Quick Start Guide

Get started with Google Maps Data Extractor in 3 simple steps!

## Step 1: Verify Installation

The dependencies are already installed. Verify by checking:

```bash
npm list puppeteer
```

## Step 2: Run Your First Extraction

Try this example command:

```bash
node src/index.js "Computer dealers in Ahmedabad" --max-results 10
```

This will:
- Launch a headless Chrome browser
- Search Google Maps for "Computer dealers in Ahmedabad"
- Extract details from the first 10 results
- Save to `output/computer_dealers_in_ahmedabad_[timestamp].csv`

## Step 3: View Results

Open the generated CSV file in Excel or any spreadsheet application.

## What You'll Get

Each extracted business includes:
- ✅ Business Name
- ✅ Full Address
- ✅ Phone Number
- ✅ Website URL
- ✅ Star Rating
- ✅ Number of Reviews
- ✅ Business Category
- ✅ Business Hours
- ✅ Price Level (if available)
- ✅ Plus Code
- ✅ Google Maps URL

## Common Commands

### See the browser in action:
```bash
node src/index.js "Your query" --headless false --max-results 5
```

### Export to JSON instead of CSV:
```bash
node src/index.js "Your query" --format json
```

### Custom output filename:
```bash
node src/index.js "Your query" --output my_results.csv
```

### Extract more results:
```bash
node src/index.js "Your query" --max-results 100
```

## Tips for Your First Run

1. **Start Small**: Use `--max-results 5` for your first test
2. **Watch It Work**: Add `--headless false` to see the browser
3. **Be Patient**: Each business takes 2-3 seconds to extract
4. **Check Output**: Results are saved in the `output/` folder

## Troubleshooting

### Browser won't launch?
- Make sure Node.js v16+ is installed
- Try: `npm install` again

### No results found?
- Check your internet connection
- Try a simpler query like "Restaurants in Mumbai"
- Add `--timeout 20000` for slower connections

### Getting errors?
- Check `extraction_errors.log` for details
- Try running with `--headless false` to see what's happening

## Next Steps

- Read [README.md](README.md) for detailed documentation
- Check [USAGE_EXAMPLES.md](USAGE_EXAMPLES.md) for more examples
- Experiment with different queries and options

## Need Help?

Common issues and solutions are in the [README.md](README.md) under "Troubleshooting".

---

**Ready to extract?** Run this now:

```bash
node src/index.js "Computer dealers in Ahmedabad" --max-results 10
```

Happy extracting! 🗺️✨
