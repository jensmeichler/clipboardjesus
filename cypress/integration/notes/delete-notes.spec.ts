import multipleNotesTab from "../../fixtures/multiple-notes.json";
import {dataCy, selectors} from "../../support/selectors";

describe('Delete notes', () => {
  beforeEach(() => {
    cy.seed(multipleNotesTab);
    cy.visit('/');
  })

  it('should delete single note on delete click', () => {
    cy.dataCy(dataCy.note.note).should('have.length', 3);
    cy.dataCy(dataCy.note.deleteBtn).first().click();
    cy.dataCy(dataCy.note.note).should('have.length', 2);
    cy.dataCy(dataCy.note.deleteBtn).first().click();
    cy.dataCy(dataCy.note.note).should('have.length', 1);
    cy.dataCy(dataCy.note.deleteBtn).click();
    cy.dataCy(dataCy.note.note).should('not.exist');
  })

  it('should delete multiple notes on delete key', () => {
    cy.dataCy(dataCy.note.content).eq(0).click({shiftKey: true});
    cy.dataCy(dataCy.note.content).eq(1).click({shiftKey: true});
    cy.dataCy(dataCy.note.content).eq(2).click({shiftKey: true});
    cy.dataCy(dataCy.tab.content).rightclick();
    cy.get(selectors.menu).contains('Delete').click();
    cy.dataCy(dataCy.note.content).should('not.exist');
  })
})
