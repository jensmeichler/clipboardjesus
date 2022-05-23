/// <reference types="cypress" />

import {dataCy, selectors} from "../support/selectors";

context('Localization functionality', () => {
  it('should be localized in english, german, ukrainian', () => {
    cy.lang('en');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Switch language');

    cy.lang('de');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Sprache wechseln');

    cy.lang('ua');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Змінити мову');
  })
})
