/// <reference types="cypress" />

import singleNoteTab from '../../fixtures/single-note.json';
import multipleNotesTab from '../../fixtures/multiple-notes.json';
import {dataCy, selectors} from "../../support/selectors";

context('Note functionality', () => {
  describe('Import notes', () => {
    beforeEach(() => {
      cy.seed([singleNoteTab]);
      cy.visit('/');
    })

    it('should contain a single note', () => {
      cy.dataCy(dataCy.note.note).should('have.length', 1);
    })

    it('should contain text "test"', () => {
      cy.dataCy(dataCy.note.note).should('contain', 'test');
    })
  })

  describe('Create notes', () => {
    beforeEach(() => {
      cy.visit('/');
    })

    it('should open new note dialog on context menu selection', () => {
      cy.dataCy(dataCy.tab.content).rightclick();
      cy.dataCy(dataCy.tab.menu).contains('Create note').click();
      cy.dataCy(dataCy.note.dialog.content).should('be.visible');
    })

    it('should create new note after dialog submit', () => {
      cy.dataCy(dataCy.tab.content).rightclick();
      cy.dataCy(dataCy.tab.menu).contains('Create note').click();
      cy.dataCy(dataCy.note.dialog.content).type('FooBar');
      cy.dataCy(dataCy.note.dialog.header).type('Baz');
      cy.dataCy(dataCy.note.dialog.submit).click();
      cy.dataCy(dataCy.note.note)
        .should('contain', 'FooBar')
        .and('contain', 'Baz');
    })
  })

  describe('Update notes', () => {
    beforeEach(() => {
      cy.seed([singleNoteTab]);
      cy.visit('/');
    })

    it('should update note content after edit submit', () => {
      cy.dataCy(dataCy.note.editBtn).click();
      cy.dataCy(dataCy.note.dialog.content).clear();
      cy.dataCy(dataCy.note.dialog.content).type('Updated text');
      cy.dataCy(dataCy.note.dialog.submit).click();
      cy.dataCy(dataCy.note.note).should('contain', 'Updated text');
    })

    it('should not update note content after edit cancel', () => {
      cy.dataCy(dataCy.note.editBtn).click();
      cy.dataCy(dataCy.note.dialog.content).clear();
      cy.dataCy(dataCy.note.dialog.content).type('Updated text');
      cy.dataCy(dataCy.note.dialog.submit).click();
      cy.dataCy(dataCy.note.note).should('not.contain', 'Updated text');
    })

    it('should update note header after edit', () => {
      cy.dataCy(dataCy.note.editBtn).click();
      cy.dataCy(dataCy.note.dialog.header).type('Added header');
      cy.dataCy(dataCy.note.dialog.submit).click();
      cy.dataCy(dataCy.note.note).should('contain', 'Added header');
    })
  })

  describe('Delete notes', () => {
    beforeEach(() => {
      cy.seed([multipleNotesTab]);
      cy.visit('/');
    })

    it('should delete single note on delete click', () => {
      cy.dataCy(dataCy.note.note).should('have.length', 3);
      cy.dataCy(dataCy.note.deleteBtn).first().click();
      cy.dataCy(dataCy.note.note).should('have.length', 2);
      cy.dataCy(dataCy.note.deleteBtn).first().click();
      cy.dataCy(dataCy.note.note).should('have.length', 1);
      cy.dataCy(dataCy.note.deleteBtn).click();
      cy.dataCy(dataCy.note.note).should('not.exist');
    })

    it('should delete multiple notes on delete key', () => {
      cy.dataCy(dataCy.note.content).eq(0).click({shiftKey: true});
      cy.dataCy(dataCy.note.content).eq(1).click({shiftKey: true});
      cy.dataCy(dataCy.note.content).eq(2).click({shiftKey: true});
      cy.dataCy(dataCy.tab.content).rightclick();
      cy.get(selectors.menu).contains('Delete').click();
      cy.dataCy(dataCy.note.content).should('not.exist');
    })
  })
})
