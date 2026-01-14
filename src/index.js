#!/usr/bin/env node

import { Command } from 'commander';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { GoogleMapsScraper } from './scraper.js';
import { BusinessDataExtractor } from './extractor.js';
import { CSVExporter } from './csv-exporter.js';
import { ErrorHandler, handleUncaughtErrors, setupGracefulShutdown } from './error-handler.js';
import { log } from './utils.js';

handleUncaughtErrors();

const program = new Command();

program
  .name('gmap-extractor')
  .description('Extract business data from Google Maps search results')
  .version('1.0.0')
  .argument('<query>', 'Search query (e.g., "Computer dealers in Ahmedabad")')
  .option('-o, --output <filename>', 'Custom output filename')
  .option('--headless <boolean>', 'Run browser in headless mode', 'true')
  .option('--timeout <ms>', 'Maximum wait time per business (ms)', '10000')
  .option('--max-results <number>', 'Maximum number of results to extract')
  .option('--format <type>', 'Output format: csv, json, or both', 'csv')
  .action(async (query, options) => {
    console.log(chalk.bold.cyan('\n🗺️  Google Maps Data Extractor\n'));

    const headless = options.headless === 'true' || options.headless === true;
    const timeout = parseInt(options.timeout);
    const maxResults = options.maxResults ? parseInt(options.maxResults) : null;
    const format = options.format.toLowerCase();

    let scraper = null;
    let progressBar = null;
    const errorHandler = new ErrorHandler();

    try {
      scraper = new GoogleMapsScraper({
        headless,
        timeout,
        maxResults
      });

      setupGracefulShutdown(scraper);

      await scraper.initialize();

      const searchSuccess = await scraper.searchGoogleMaps(query);
      if (!searchSuccess) {
        throw new Error('Failed to perform Google Maps search');
      }

      const totalResults = await scraper.scrollToLoadAllResults();
      
      if (totalResults === 0) {
        log('No results found for this query', 'warning');
        await scraper.close();
        return;
      }

      const resultsToExtract = maxResults ? Math.min(maxResults, totalResults) : totalResults;

      progressBar = new cliProgress.SingleBar({
        format: chalk.cyan('{bar}') + ' | {percentage}% | {value}/{total} businesses | ETA: {eta}s',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        hideCursor: true
      });

      log(`Starting extraction of ${resultsToExtract} businesses...`);
      progressBar.start(resultsToExtract, 0);

      const extractor = new BusinessDataExtractor(scraper.page);
      const businesses = [];
      const errors = [];

      for (let i = 0; i < resultsToExtract; i++) {
        try {
          const clicked = await errorHandler.executeWithRetry(
            () => scraper.clickBusinessByIndex(i),
            `Click business ${i + 1}`,
            2,
            1000
          );
          
          if (!clicked) {
            errors.push({ index: i, error: 'Failed to click business' });
            progressBar.update(i + 1);
            continue;
          }

          const businessData = await errorHandler.executeWithRetry(
            () => extractor.extractBusinessDetails(null, i),
            `Extract business ${i + 1}`,
            2,
            1000
          );
          
          if (businessData) {
            businesses.push(businessData);
          } else {
            errors.push({ index: i, error: 'Failed to extract data' });
          }

          progressBar.update(i + 1);
        } catch (error) {
          errorHandler.logError(`Business ${i + 1}`, error, { index: i });
          errors.push({ index: i, error: error.message });
          progressBar.update(i + 1);
        }
      }

      progressBar.stop();

      if (businesses.length === 0) {
        log('No business data extracted', 'error');
        await scraper.close();
        return;
      }

      const exporter = new CSVExporter();
      const summary = exporter.generateSummaryReport(businesses, errors);

      if (format === 'csv' || format === 'both') {
        const csvFile = await exporter.exportToCSV(businesses, query, options.output);
        if (csvFile) {
          console.log(chalk.green(`\n✓ CSV file saved: ${csvFile}`));
        }
      }

      if (format === 'json' || format === 'both') {
        const jsonFilename = options.output 
          ? options.output.replace('.csv', '.json')
          : null;
        const jsonFile = await exporter.exportToJSON(businesses, query, jsonFilename);
        if (jsonFile) {
          console.log(chalk.green(`✓ JSON file saved: ${jsonFile}`));
        }
      }

      exporter.printSummary(summary);

      if (errors.length > 0) {
        log(`${errors.length} businesses failed to extract`, 'warning');
      }

      if (errorHandler.hasErrors()) {
        const errorReport = errorHandler.exportErrorReport('output/error_report.json');
        if (errorReport) {
          console.log(chalk.yellow(`⚠ Error report saved: ${errorReport}`));
        }
      }

      await scraper.close();
      
      console.log(chalk.bold.green('\n✨ Extraction completed successfully!\n'));
      process.exit(0);

    } catch (error) {
      if (progressBar) {
        progressBar.stop();
      }
      
      log(`Fatal error: ${error.message}`, 'error');
      console.error(chalk.red('\n' + error.stack));

      if (scraper) {
        await scraper.close();
      }

      process.exit(1);
    }
  });

program.parse();
