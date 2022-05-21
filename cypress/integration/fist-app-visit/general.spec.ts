/// <reference types="cypress" />

context('First time visiting visit-with-data', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  describe('Layout checks', () => {
    it('should contain required buttons', () => {
      cy.dataCy('logo').should('exist');
      cy.dataCy('save-button').should('exist');
      cy.dataCy('save-as-button').should('exist');
      cy.dataCy('settings-button').should('exist');
    })

    it('should contain a single tab', () => {
      cy.dataCy('tab').should('exist').and('have.length', 1);
    })

    it('should not be able to save empty board', () => {
      cy.dataCy('save-button').should('be.disabled');
      cy.dataCy('save-as-button').should('be.disabled');
    })

    it('should not contain items', () => {
      cy.dataCy('note').should('not.exist');
      cy.dataCy('task-list').should('not.exist');
      cy.dataCy('note-list').should('not.exist');
      cy.dataCy('image').should('not.exist');
    })
  })

  describe('Functionality checks', () => {
    it('should open context menu on right click', () => {
      cy.dataCy('tab-context-menu').should('not.exist');
      cy.dataCy('tab').rightclick();
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
})
