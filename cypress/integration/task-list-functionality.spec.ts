/// <reference types="cypress" />

import singleTaskListTab from "../fixtures/single-task-list.json";
import {dataCy, selectors} from "../support/selectors";

describe('Task list functionality', () => {
  describe('Create task lists', () => {
    beforeEach(() => {
      cy.visit('/');
    })

    it('should create new task list after dialog submit', () => {
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

  describe('Delete task list', () => {
    beforeEach(() => {
      cy.seed(singleTaskListTab);
      cy.visit('/');
    })

    xit('should delete task list on delete click', () => {
      cy.dataCy(dataCy.taskList.tasks).should('have.length', 4);
      //TODO: Delete first task
      cy.dataCy(dataCy.taskList.tasks).should('have.length', 3);
      //TODO: Delete first task
      cy.dataCy(dataCy.taskList.tasks).should('have.length', 2);
      //TODO: Delete first task
      cy.dataCy(dataCy.taskList.taskList).should('be.visible');
      cy.dataCy(dataCy.taskList.deleteBtn).click();
      cy.dataCy(dataCy.taskList.taskList).should('not.exist');
    })
  })
})
