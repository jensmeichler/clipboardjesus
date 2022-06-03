import {dataCy} from "../../support/selectors";

describe('Welcome page', () => {
  it('should show welcome page on first app launch', () => {
    cy.visit('/');
    cy.dataCy(dataCy.tab.content).should('contain', 'Welcome to Clip#board');
    cy.dataCy(dataCy.note.note).should('exist');
    cy.dataCy(dataCy.taskList.taskList).should('exist');
    cy.dataCy(dataCy.noteList.noteList).should('exist');
    cy.url().should('contain', 'Welcome');
  })

  it('should be possible to edit the welcome page', () => {
    cy.visit('/');
    cy.dataCy(dataCy.note.editBtn).click({force: true});
    cy.dataCy(dataCy.note.dialog.submit).click();
    cy.dataCy(dataCy.taskList.editBtn).click({force: true});
    cy.dataCy(dataCy.taskList.dialog.submit).click();
  })
})
