const { defineConfig } = require('cypress');

module.exports = defineConfig({
    e2e: {
    baseUrl: 'http://localhost:3000',

    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.js',

    reporter: 'mochawesome',
    reporterOptions: {
      reportDir: 'cypress/reports',
      overwrite: false,
      html: true,
      json: true,
    },

    videosFolder: 'cypress/videos',
    screenshotsFolder: 'cypress/screenshots',

    video: true,
    screenshotOnRunFailure: true,

    viewportWidth: 1280,
    viewportHeight: 800,

    defaultCommandTimeout: 6000,
    requestTimeout: 6000,

    setupNodeEvents(on, config) {
      return config;
    },
  },
});

