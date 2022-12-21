import {Tab} from "../../src/app/models";

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to seed tabs into the localStorage.
       * @example cy.seed([tab1, tab2], 1)
       */
      seed(tabs: Tab | Tab[], tabIndex?: number): void
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
       * Custom command to skip the welcome page and start with a clean window.
       */
      clean(): void
    }
  }
}
