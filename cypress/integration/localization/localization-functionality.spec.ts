/// <reference types="cypress" />

import {dataCy, selectors} from "../../support/selectors";

context('Localization functionality', () => {
  it('should be localized in english', () => {
    cy.lang('en');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Switch language');
  })

  it('should be localized in german', () => {
    cy.lang('de');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Sprache wechseln');
  })

  it('should be localized in ukrainian', () => {
    cy.lang('ua');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Змінити мову');
  })
})
