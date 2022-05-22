/// <reference types="cypress" />

import singleNoteTab from '../../fixtures/single-note.json';
import {dataCy} from "../../support/selectors";

context('Note functionality', () => {
  beforeEach(() => {
    cy.seed([singleNoteTab]);
    cy.visit('/');
  })

  describe('Import notes', () => {
    it('should contain a single note', () => {
      cy.dataCy(dataCy.note.content).should('have.length', 1);
    })

    it('should contain text "test"', () => {
      cy.dataCy(dataCy.note.content).should('contain', 'test');
    })
  })

  describe('Create notes', () => {
    it('should open new note dialog on context menu selection', () => {
      cy.dataCy(dataCy.tab.content).rightclick();
      cy.dataCy(dataCy.tab.contextMenu).contains('Create note').click();
      cy.dataCy(dataCy.dialogs.editNote).should('be.visible');
    })

    xit('should create new note after dialog submit', () => {
      //TODO
    })
  })

  describe('Update notes', () => {
    xit('should update note content after edit', () => {
      //TODO
    })

    xit('should update note header after edit', () => {
      //TODO
    })
  })

  describe('Delete notes', () => {
    xit('should delete single note on delete click', () => {
      //TODO
    })

    xit('should delete multiple notes on delete key', () => {
      //TODO
    })
  })
})
