import { defineConfig } from 'cypress'
import PluginEvents = Cypress.PluginEvents;
import PluginConfigOptions = Cypress.PluginConfigOptions;

export default defineConfig({
  projectId: 'c1e5r5',
  e2e: {
    setupNodeEvents(on: PluginEvents, config: PluginConfigOptions) {
      // `on` is used to hook into various events Cypress emits
      // `config` is the resolved Cypress config
    },
    baseUrl: 'http://localhost:4201',
    specPattern: 'cypress/e2e/**/*.cy.{js,ts}',
  },
})
