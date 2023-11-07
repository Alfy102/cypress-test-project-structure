const { defineConfig } = require('cypress');
const zipper = require('zip-local');
const createBundler = require('@bahmutov/cypress-esbuild-preprocessor');
const preprocessor = require('@badeball/cypress-cucumber-preprocessor');
const { beforeRunHook, afterRunHook } = require('cypress-mochawesome-reporter/lib');
const createEsbuildPlugin =
  require('@badeball/cypress-cucumber-preprocessor/esbuild').createEsbuildPlugin;
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const now = new Date();
const currentLogTime = now
  .toLocaleString('en-UK', { hour12: false })
  .replace(',', '')
  .replace(/:.. /, '')
  .replaceAll('/', '')
  .replaceAll(' ', '')
  .replaceAll(':', '')
  .replaceAll('pm', '')
  .replaceAll('am', '')
  .trim() + `_${uuidv4()}`; 

module.exports = defineConfig ({
  waitForAnimations: true,
  viewportHeight: 1080,
  viewportWidth: 1920,
  downloadsFolder: 'cypress/downloads/',
  screenshotOnRunFailure: true,
  chromeWebSecurity: false,
  video: true,
  videoCompression: true,
  includeShadowDom: true,
  defaultCommandTimeout: 20000,
  requestTimeout: 60000,
  responseTimeout: 120000,
  pageLoadTimeout: 120000,
  numTestsKeptInMemory: 0,
  retries: 0,
  reporter: 'cypress-multi-reporters',
  env: {
    cypressRunTime: currentLogTime
  },
  reporterOptions: {
    reporterEnabled: 'cypress-mochawesome-reporter, mocha-junit-reporter',
    cypressMochawesomeReporterReporterOptions: {
      reportDir: 'cypress/reports/' + currentLogTime,
      reportFilename: '[name]',
      embeddedScreenshots: true,
      saveAllAttempts: true,
      code: false,
      inlineAssets: true
    },
    mochaJunitReporterReporterOptions: {
      mochaFile: 'cypress/reports/' + currentLogTime + '/results-[hash].xml'
    }
  },
  e2e: {
    specPattern: 'cypress/e2e/**/*.{feature,features}',
    testIsolation: false,
    /**
     *
     * @param {object} on
     *  on is a function that you will use to register listeners on various events that Cypress exposes
     * @param {object} config
     * config is the resolved Cypress configuration of the opened project.
     * @returns {object}
     * The extended on and config object
     */
    async setupNodeEvents(on, config) {
      config.baseUrl = config.env.BASE_URL;
      config.reporterOptions.reportPageTitle = config.env.STRATUS_URL;
      let testOutputFile = 'cypress/reports/output.json';
      const options = {
        printLogsToFile: 'always',
        outputRoot: 'cypress/reports/' + currentLogTime + '/',//config.projectRoot + logsOutputPath,
        // Used to trim the base path of specs and reduce nesting in the generated output directory.
        specRoot: 'cypress/e2e',
        outputTarget: {
          'terminal-logs|txt': 'txt'
        }
      };
      require('cypress-terminal-report/src/installLogsPrinter')(on, options);
      await preprocessor.addCucumberPreprocessorPlugin(on, config);
      require('cypress-mochawesome-reporter/plugin')(on);

      on('after:spec', (spec, results) => {
        if (results && results.video) {
          // Do we have failures for any retry attempts?
          const failures = results.tests.some((test) =>
            test.attempts.some((attempt) => attempt.state === 'failed')
          );
          if (!failures) {
            // delete the video if the spec passed and no tests retried
            fs.unlinkSync(results.video);
          }
        }
      });

      await on('before:run', async (details) => {
        console.log(`Test Run Environment: ${details.config.baseUrl}`);
        await beforeRunHook(details);
      });

      await on('after:run', async (results) => {
        let finalResult;
        console.log('override after:run');
        console.log('---------------------------------------------------');
        let input = config.reporterOptions.cypressMochawesomeReporterReporterOptions.reportDir;
        console.log('Compressing log files to: ' + input + '.zip');
        await afterRunHook(results);

      });

      on(
        'file:preprocessor',
        createBundler({
          plugins: [createEsbuildPlugin(config)]
        })
      );
      return config;
    }
  }
});
