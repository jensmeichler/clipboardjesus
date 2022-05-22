/// <reference types="cypress" />

import {dataCy} from "../../support/selectors";

context('Tab usability', () => {
  beforeEach(() => {
    cy.visit('/');
  })

  it('should contain required buttons', () => {
    cy.dataCy('logo').should('exist');
    cy.dataCy('save-button').should('exist');
    cy.dataCy('save-as-button').should('exist');
    cy.dataCy('settings-button').should('exist');
  })

  it('should contain a single tab', () => {
    cy.dataCy(dataCy.tab.content).should('exist').and('have.length', 1);
  })

  it('should not be able to save empty board', () => {
    cy.dataCy('save-button').should('be.disabled');
    cy.dataCy('save-as-button').should('be.disabled');
  })

  it('should not contain items', () => {
    cy.dataCy(dataCy.note.content).should('not.exist');
    cy.dataCy(dataCy.taskList.content).should('not.exist');
    cy.dataCy(dataCy.noteList.content).should('not.exist');
    cy.dataCy(dataCy.image.content).should('not.exist');
  })
})
