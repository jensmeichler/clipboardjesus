import singleNoteTab from "../../fixtures/single-note.json";
import {dataCy} from "../../support/selectors";

describe('Update notes', () => {
  beforeEach(() => {
    cy.seed(singleNoteTab);
    cy.visit('/');
  })

  it('should update note after edit submit', () => {
    cy.dataCy(dataCy.note.editBtn).click();
    cy.dataCy(dataCy.note.dialog.content).clear();
    cy.dataCy(dataCy.note.dialog.content).type('Updated text');
    cy.dataCy(dataCy.note.dialog.header).click();
    cy.dataCy(dataCy.note.dialog.header).type('Added header');
    cy.dataCy(dataCy.note.dialog.submit).click();
    cy.dataCy(dataCy.note.content).should('contain', 'Updated text');
    cy.dataCy(dataCy.note.header).should('contain', 'Added header');
  })

  it('should not update note content after edit cancel', () => {
    cy.dataCy(dataCy.note.editBtn).click();
    cy.dataCy(dataCy.note.dialog.content).clear();
    cy.dataCy(dataCy.note.dialog.content).type('Updated text');
    cy.dataCy(dataCy.note.dialog.submit).click();
    cy.dataCy(dataCy.note.content).should('not.contain', 'Updated text');
  })
})
