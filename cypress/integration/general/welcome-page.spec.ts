import {dataCy} from "../../support/selectors";

describe('Welcome page', () => {
  it('should show welcome page on first app launch', () => {
    cy.visit('/');
    cy.dataCy(dataCy.tab.content).should('contain', 'Welcome to Clip#board');
    cy.dataCy(dataCy.note.note).should('exist');
    cy.dataCy(dataCy.taskList.taskList).should('exist');
    cy.dataCy(dataCy.noteList.noteList).should('exist');
  })

  it('should be possible to edit the welcome page', () => {
    cy.visit('/');
    cy.dataCy(dataCy.note.editBtn).first().click();
    cy.dataCy(dataCy.note.dialog.submit).first().click();
    cy.dataCy(dataCy.taskList.editBtn).click();
    cy.dataCy(dataCy.taskList.dialog.submit).click();
  })
})
