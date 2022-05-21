/// <reference types="cypress" />

import singleNoteTab from '../test-data/single-note.json';

context('Notes tests', () => {
  beforeEach(() => {
    cy.seed([singleNoteTab]);
    cy.visit('/')
  })

  describe('Layout checks', () => {
    xit('should contain required buttons', () => {
      //TODO
    })

    xit('should contain a single note', () => {
      //TODO
    })

    xit('should contain text "test"', () => {
      //TODO
    })
  })

  describe('Functionality checks', () => {
    xit('should open new note dialog on context menu selection', () => {
      //TODO
    })
  })
})
