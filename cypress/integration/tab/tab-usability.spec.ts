/// <reference types="cypress" />

import {dataCy} from "../../support/selectors";

context('Tab usability', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('should not be able to save empty board', () => {
    cy.dataCy(dataCy.common.buttons.save).should('be.disabled');
    cy.dataCy(dataCy.common.buttons.save).should('be.disabled');
  })

  it('should not contain items', () => {
    cy.dataCy(dataCy.note.note).should('not.exist');
    cy.dataCy(dataCy.taskList.taskList).should('not.exist');
    cy.dataCy(dataCy.noteList.noteList).should('not.exist');
    cy.dataCy(dataCy.image.image).should('not.exist');
  })
})
