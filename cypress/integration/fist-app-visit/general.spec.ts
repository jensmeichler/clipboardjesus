/// <reference types="cypress" />

context('First time visiting visit-with-data', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  describe('Layout checks', () => {
    it('should contain required buttons', () => {
      cy.get('#logo').should('exist');
      cy.get('#save-button').should('exist');
      cy.get('#save-as-button').should('exist');
      cy.get('#settings-button').should('exist');
    })

    it('should contain a single tab', () => {
      cy.get('cb-tab').should('exist').and('have.length', 1);
    })

    it('should not be able to save empty board', () => {
      cy.get('#save-button').should('be.disabled');
      cy.get('#save-as-button').should('be.disabled');
    })

    it('should not contain items', () => {
      cy.get('cb-note').should('not.exist');
      cy.get('cb-task-list').should('not.exist');
      cy.get('cb-note-list').should('not.exist');
      cy.get('cb-image').should('not.exist');
    })
  })

  describe('Functionality checks', () => {
    it('should open context menu on right click', () => {
      cy.get('#tab-context-menu').should('not.exist');
      cy.get('cb-tab').rightclick();
      cy.get('#tab-context-menu').should('be.visible');
    })

    it('should open about dialog on logo click', () => {
      cy.get('cb-about-dialog').should('not.exist');
      cy.get('#logo').click();
      cy.get('cb-about-dialog').should('be.visible');
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
