/// <reference types="cypress" />

import {dataCy} from "../../support/selectors";

context('Tab usability', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('should contain required buttons', () => {
    cy.dataCy(dataCy.common.logo).should('exist');
    cy.dataCy(dataCy.common.buttons.save).should('exist');
    cy.dataCy(dataCy.common.buttons.saveAs).should('exist');
    cy.dataCy(dataCy.common.settings.button).should('exist');
  })

  it('should contain a single tab', () => {
    cy.dataCy(dataCy.tab.content).should('exist').and('have.length', 1);
  })

  it('should not be able to save empty board', () => {
    cy.dataCy(dataCy.common.buttons.save).should('be.disabled');
    cy.dataCy(dataCy.common.buttons.save).should('be.disabled');
  })

  it('should not contain items', () => {
    cy.dataCy(dataCy.note.note).should('not.exist');
    cy.dataCy(dataCy.taskList.content).should('not.exist');
    cy.dataCy(dataCy.noteList.content).should('not.exist');
    cy.dataCy(dataCy.image.content).should('not.exist');
  })
})
