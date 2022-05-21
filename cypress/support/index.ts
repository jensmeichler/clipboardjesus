// @ts-ignore
import {Tab} from "../../src/app/models";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to seed tabs to localStorage.
       * @example cy.seed(tabs)
       */
      seed(tabs: Tab[]): Chainable
    }
  }
}
