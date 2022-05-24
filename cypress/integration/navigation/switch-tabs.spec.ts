import singleNoteTab from '../../fixtures/single-note.json';
import multipleNotesTab from '../../fixtures/multiple-notes.json';
import singleTaskListTab from "../../fixtures/single-task-list.json";
import {dataCy} from "../../support/selectors";

describe('Switch tabs', () => {
  beforeEach(() => {
    cy.seed([singleNoteTab, multipleNotesTab, singleTaskListTab]);
    cy.visit('/?tab=2');
  })

  it('should have 3 tabs and the second tab opened', () => {
    cy.dataCy(dataCy.tab.active).should('have.length', 1);
    cy.dataCy(dataCy.tab.other).should('have.length', 2);
    cy.dataCy(dataCy.tab.other).eq(0).should('contain', '1');
    cy.dataCy(dataCy.tab.active).should('contain', '2');
    cy.dataCy(dataCy.tab.other).eq(1).should('contain', '3');
  })
})
