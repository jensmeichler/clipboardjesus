/// <reference types="cypress" />

import {dataCy} from "../../support/selectors";

context('Tab functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('should open context menu on right click', () => {
    cy.dataCy(dataCy.tab.contextMenu).should('not.exist');
    cy.dataCy(dataCy.tab.content).rightclick();
    cy.dataCy(dataCy.tab.contextMenu).should('be.visible');
  })

  it('should open about dialog on logo click', () => {
    cy.dataCy(dataCy.dialogs.about).should('not.exist');
    cy.dataCy(dataCy.common.logo).click();
    cy.dataCy(dataCy.dialogs.about).should('be.visible');
  })

  xit('should be localized in english', () => {
    //TODO
  })

  xit('should be localized in german', () => {
    //TODO
  })

  xit('should be localized in ukrainian', () => {
    //TODO
  })
})
