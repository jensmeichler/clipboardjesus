import {Tab} from "../../src/app/models";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to seed tabs to localStorage.
       * @example cy.seed([tab1, tab2])
       */
      seed(tabs: Tab | Tab[]): void
      /**
       * Custom command to get elements with data-cy.
       * @example cy.dataCy('note').should(...)
       */
      dataCy(dataCy: string): Chainable
      /**
       * Custom command to set language.
       * @example cy.lang('en')
       */
      lang(language: 'en' | 'de' | 'ua'): void
      /**
       * Custom command skip the welcome page and start with a clean window.
       * @example cy.lang('en')
       */
      clean(): void
    }
  }
}
