/// <reference types="cypress" />

import {dataCy, selectors} from "../../support/selectors";

context('Tab functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('should open context menu on right click', () => {
    cy.get(selectors.menu).should('not.exist');
    cy.dataCy(dataCy.tab.content).rightclick();
    cy.get(selectors.menu).should('be.visible');
  })

  it('should open about dialog on logo click', () => {
    cy.dataCy(dataCy.dialogs.about).should('not.exist');
    cy.dataCy(dataCy.common.logo).click();
    cy.dataCy(dataCy.dialogs.about).should('be.visible');
  })
})
