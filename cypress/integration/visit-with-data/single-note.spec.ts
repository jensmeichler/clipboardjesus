/// <reference types="cypress" />

import singleNoteTab from '../../fixtures/single-note.json';

context('Notes tests', () => {
  beforeEach(() => {
    cy.seed([singleNoteTab]);
    cy.visit('/');
  })

  describe('Layout checks', () => {
    it('should contain required buttons', () => {
      cy.dataCy('edit-note').should('exist');
      cy.dataCy('delete-note').should('exist');
      cy.dataCy('more-note').should('exist');
    })

    it('should contain a single note', () => {
      cy.dataCy('note').should('have.length', 1);
    })

    it('should contain text "test"', () => {
      cy.dataCy('note').should('contain', 'test');
    })
  })

  describe('Functionality checks', () => {
    it('should open new note dialog on context menu selection', () => {
      cy.dataCy('tab').rightclick();
      cy.dataCy('tab-context-menu').contains('Create note').click();
      cy.dataCy('edit-note-dialog').should('be.visible');
    })
  })
})
