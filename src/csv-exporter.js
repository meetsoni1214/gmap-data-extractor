import { writeToPath } from '@fast-csv/format';
import path from 'path';
import fs from 'fs';
import { CONFIG } from './config.js';
import { generateOutputFilename, log } from './utils.js';

export class CSVExporter {
  constructor(outputDir = CONFIG.export.outputDir) {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async exportToCSV(data, query, customFilename = null) {
    if (!data || data.length === 0) {
      log('No data to export', 'warning');
      return null;
    }

    const filename = customFilename || generateOutputFilename(query, 'csv');
    const filepath = path.join(this.outputDir, filename);

    try {
      log(`Exporting ${data.length} records to CSV...`);

      const headers = [
        'Business Name',
        'Category',
        'Address',
        'Phone',
        'Website',
        'Rating',
        'Review Count',
        'Price Level',
        'Business Hours',
        'Plus Code',
        'Google Maps URL'
      ];

      const rows = data.map(business => [
        business.name || 'N/A',
        business.category || 'N/A',
        business.address || 'N/A',
        business.phone || 'N/A',
        business.website || 'N/A',
        business.rating || 'N/A',
        business.reviewCount || 'N/A',
        business.priceLevel || 'N/A',
        business.hours || 'N/A',
        business.plusCode || 'N/A',
        business.url || 'N/A'
      ]);

      await writeToPath(filepath, rows, {
        headers: headers,
        writeHeaders: true,
        quote: true
      });

      log(`Data exported successfully to: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      log(`Error exporting to CSV: ${error.message}`, 'error');
      throw error;
    }
  }

  async exportToJSON(data, query, customFilename = null) {
    if (!data || data.length === 0) {
      log('No data to export', 'warning');
      return null;
    }

    const filename = customFilename || generateOutputFilename(query, 'json');
    const filepath = path.join(this.outputDir, filename);

    try {
      log(`Exporting ${data.length} records to JSON...`);

      const jsonData = {
        query: query,
        exportDate: new Date().toISOString(),
        totalResults: data.length,
        results: data
      };

      fs.writeFileSync(filepath, JSON.stringify(jsonData, null, 2), 'utf-8');

      log(`Data exported successfully to: ${filepath}`, 'success');
      return filepath;
    } catch (error) {
      log(`Error exporting to JSON: ${error.message}`, 'error');
      throw error;
    }
  }

  generateSummaryReport(data, errors = []) {
    const summary = {
      totalExtracted: data.length,
      totalErrors: errors.length,
      successRate: data.length > 0 
        ? ((data.length / (data.length + errors.length)) * 100).toFixed(2) + '%'
        : '0%',
      fieldsCompletion: this.calculateFieldCompletion(data)
    };

    return summary;
  }

  calculateFieldCompletion(data) {
    if (data.length === 0) return {};

    const fields = ['name', 'address', 'phone', 'website', 'rating', 'reviewCount', 'category', 'hours', 'priceLevel', 'plusCode'];
    const completion = {};

    fields.forEach(field => {
      const filledCount = data.filter(item => 
        item[field] && item[field] !== 'N/A' && item[field] !== null
      ).length;
      completion[field] = ((filledCount / data.length) * 100).toFixed(1) + '%';
    });

    return completion;
  }

  printSummary(summary) {
    console.log('\n' + '='.repeat(50));
    console.log('EXTRACTION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Records Extracted: ${summary.totalExtracted}`);
    console.log(`Total Errors: ${summary.totalErrors}`);
    console.log(`Success Rate: ${summary.successRate}`);
    console.log('\nField Completion Rates:');
    Object.entries(summary.fieldsCompletion).forEach(([field, rate]) => {
      console.log(`  ${field}: ${rate}`);
    });
    console.log('='.repeat(50) + '\n');
  }
}
