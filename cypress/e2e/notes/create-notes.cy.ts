import {dataCy, selectors} from "../../support/selectors";

describe('Create notes', () => {
  beforeEach(() => {
    cy.clean();
    cy.visit('/');
  })

  it('should create new note after dialog submit', () => {
    cy.dataCy(dataCy.tab.content).rightclick();
    cy.get(selectors.menu).contains('Create note').click();
    cy.dataCy(dataCy.note.dialog.content).type('FooBar');
    cy.dataCy(dataCy.note.dialog.header).type('Baz');
    cy.dataCy(dataCy.note.dialog.submit).click();
    cy.dataCy(dataCy.note.content).should('contain', 'FooBar')
    cy.dataCy(dataCy.note.header).should('contain', 'Baz');
  })
})
