import singleTaskListTab from "../../fixtures/single-task-list.json";
import {dataCy} from "../../support/selectors";

describe('Delete task lists', () => {
  beforeEach(() => {
    cy.seed(singleTaskListTab);
    cy.visit('/');
  })

  it('should delete task list on delete click', () => {
    cy.dataCy(dataCy.taskList.tasks).should('have.length', 4);
    cy.dataCy(dataCy.taskList.task.deleteBtn).first().click();
    cy.dataCy(dataCy.taskList.tasks).should('have.length', 3);
    cy.dataCy(dataCy.taskList.task.deleteBtn).first().click();
    cy.dataCy(dataCy.taskList.tasks).should('have.length', 2);
    cy.dataCy(dataCy.taskList.task.deleteBtn).first().click();
    cy.dataCy(dataCy.taskList.taskList).should('be.visible');
    cy.dataCy(dataCy.taskList.deleteBtn).click();
    cy.dataCy(dataCy.taskList.taskList).should('not.exist');
  })
})
