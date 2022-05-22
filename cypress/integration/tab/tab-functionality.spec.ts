/// <reference types="cypress" />

import {dataCy} from "../../support/selectors";

context('Tab functionality', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('should open context menu on right click', () => {
    cy.dataCy('tab-context-menu').should('not.exist');
    cy.dataCy(dataCy.tab.content).rightclick();
    cy.dataCy('tab-context-menu').should('be.visible');
  })

  it('should open about dialog on logo click', () => {
    cy.dataCy('about-dialog').should('not.exist');
    cy.dataCy('logo').click();
    cy.dataCy('about-dialog').should('be.visible');
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
