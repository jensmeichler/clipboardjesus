/// <reference types="cypress" />

import singleNoteTab from '../../fixtures/single-note.json';

context('Notes tests', () => {
  beforeEach(() => {
    cy.seed([singleNoteTab]);
    cy.visit('/');
  })

  describe('Layout checks', () => {
    xit('should contain required buttons', () => {
      //TODO
    })

    it('should contain a single note', () => {
      cy.get('cb-note').should('have.length', 1);
    })

    it('should contain text "test"', () => {
      cy.get('cb-note').should('contain', 'test');
    })
  })

  describe('Functionality checks', () => {
    it('should open new note dialog on context menu selection', () => {
      cy.get('cb-tab').rightclick();
      cy.get('#tab-context-menu').contains('Create note').click();
      cy.get('cb-edit-note-dialog').should('be.visible');
    })
  })
})
