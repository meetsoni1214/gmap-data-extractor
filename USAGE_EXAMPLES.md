# Usage Examples for Google Maps Extractor

This file contains practical examples of how to use the Google Maps Data Extractor.

## Basic Examples

### 1. Extract Computer Dealers in Ahmedabad

```bash
node src/index.js "Computer dealers in Ahmedabad"
```

### 2. Extract Restaurants with Custom Filename

```bash
node src/index.js "Best restaurants in Mumbai" --output mumbai_restaurants.csv
```

### 3. Extract Limited Results (First 20)

```bash
node src/index.js "Coffee shops in Bangalore" --max-results 20
```

### 4. Export to JSON Format

```bash
node src/index.js "Hotels in Delhi" --format json
```

### 5. Export to Both CSV and JSON

```bash
node src/index.js "Gyms in Chennai" --format both
```

## Advanced Examples

### 6. Run in Visible Mode (Watch the Browser)

```bash
node src/index.js "Car showrooms in Pune" --headless false
```

### 7. Custom Timeout for Slow Connections

```bash
node src/index.js "Medical stores near me" --timeout 20000
```

### 8. Combination of Options

```bash
node src/index.js "Electronics shops in Hyderabad" --max-results 30 --output hyderabad_electronics.csv --timeout 15000
```

## Business Category Examples

### Retail

```bash
node src/index.js "Furniture stores in Jaipur"
node src/index.js "Bookstores in Kolkata"
node src/index.js "Mobile phone shops in Surat"
```

### Food & Beverage

```bash
node src/index.js "Pizza places in Gurgaon"
node src/index.js "Bakeries in Lucknow"
node src/index.js "Ice cream parlors in Indore"
```

### Services

```bash
node src/index.js "Hair salons in Chandigarh"
node src/index.js "Car repair shops in Vadodara"
node src/index.js "Plumbers in Nagpur"
```

### Healthcare

```bash
node src/index.js "Dentists in Ahmedabad"
node src/index.js "Hospitals in Mumbai"
node src/index.js "Diagnostic centers in Delhi"
```

### Education

```bash
node src/index.js "Coaching classes in Kota"
node src/index.js "Language schools in Pune"
node src/index.js "Computer training institutes in Bangalore"
```

## Location-Based Examples

### Specific Area

```bash
node src/index.js "Restaurants in Koregaon Park, Pune"
node src/index.js "Hotels near Airport, Mumbai"
node src/index.js "Cafes in MG Road, Bangalore"
```

### Near Me Searches

```bash
node src/index.js "ATMs near me"
node src/index.js "Pharmacies near me"
node src/index.js "Petrol pumps near me"
```

## Testing & Development

### Quick Test with Limited Results

```bash
node src/index.js "Test query" --max-results 5 --headless false
```

### Debug Mode (Visible Browser + Extended Timeout)

```bash
node src/index.js "Your search query" --headless false --timeout 30000
```

## Output Management

### Organize by Date

```bash
node src/index.js "Daily query" --output "results_$(date +%Y%m%d).csv"
```

### Multiple Queries in Sequence

```bash
node src/index.js "Hotels in Goa" --output goa_hotels.csv && \
node src/index.js "Restaurants in Goa" --output goa_restaurants.csv && \
node src/index.js "Tourist spots in Goa" --output goa_tourist_spots.csv
```

## Tips for Best Results

1. **Be Specific**: More specific queries yield better results
   - Good: "Italian restaurants in South Mumbai"
   - Less Good: "Food places"

2. **Use Standard Names**: Use common location names
   - Good: "Shops in Mumbai"
   - Less Good: "Shops in Bombay" (though this might still work)

3. **Test First**: For large extractions, test with `--max-results 10` first

4. **Watch Progress**: Use `--headless false` during development to see what's happening

5. **Handle Errors**: Check `extraction_errors.log` if results are incomplete

## Batch Processing Example

Create a script to extract multiple queries:

```bash
#!/bin/bash
queries=(
  "Computer dealers in Ahmedabad"
  "Mobile shops in Ahmedabad"
  "Electronics stores in Ahmedabad"
)

for query in "${queries[@]}"; do
  echo "Processing: $query"
  node src/index.js "$query" --max-results 50
  sleep 60  # Wait 60 seconds between queries
done
```

## Performance Considerations

- **Small Extractions** (< 20 results): Usually takes 1-3 minutes
- **Medium Extractions** (20-50 results): Usually takes 3-7 minutes
- **Large Extractions** (50+ results): Can take 10+ minutes

Add `--max-results` to limit extraction time during testing.
