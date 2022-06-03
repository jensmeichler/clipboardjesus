import {dataCy, selectors} from "../../support/selectors";

describe('Create task lists', () => {
  it('should create new task list after dialog submit', () => {
    cy.clean();
    cy.visit('/');
    cy.dataCy(dataCy.tab.content).rightclick();
    cy.get(selectors.menu).contains('Create task list').click();
    cy.dataCy(dataCy.taskList.dialog.tasks).type('Foo{enter}');
    cy.dataCy(dataCy.taskList.dialog.tasks).type('Bar{enter}');
    cy.dataCy(dataCy.taskList.dialog.header).type('Baz');
    cy.dataCy(dataCy.taskList.dialog.submit).click();
    cy.dataCy(dataCy.taskList.tasks).eq(0).should('contain', 'Foo')
    cy.dataCy(dataCy.taskList.tasks).eq(1).should('contain', 'Bar')
    cy.dataCy(dataCy.taskList.header).should('contain', 'Baz');
  })
})
