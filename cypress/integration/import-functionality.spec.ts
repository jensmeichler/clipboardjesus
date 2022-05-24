/// <reference types="cypress" />

import manyNotesTab from '../fixtures/many-notes.json';
import {dataCy} from "../support/selectors";

describe('Localization functionality', () => {
  let multicoloredNotesCount: number;
  let yellowNotesCount: number;
  let purpleNotesCount: number;

  beforeEach(() => {
    const yellowNotesTab = {...manyNotesTab, notes: manyNotesTab.notes.filter(x => x.content === 'yellow')};
    const purpleNotesTab = {...manyNotesTab, notes: manyNotesTab.notes.filter(x => x.content === 'blue')};
    multicoloredNotesCount = manyNotesTab.notes.length;
    yellowNotesCount = yellowNotesTab.notes.length;
    purpleNotesCount = purpleNotesTab.notes.length;

    cy.seed([manyNotesTab, yellowNotesTab, purpleNotesTab]);
    cy.visit('/');
  })

  it('should import all the notes from localstorage', () => {
    cy.dataCy(dataCy.note.note).should('have.length', multicoloredNotesCount);

    // Go to yellow notes tab
    cy.dataCy(dataCy.tab.other).first().click();
    cy.dataCy(dataCy.note.note).should('have.length', yellowNotesCount);

    // Go to blue notes tab
    cy.dataCy(dataCy.tab.other).last().click();
    cy.dataCy(dataCy.note.note).should('have.length', purpleNotesCount);

    // Go to multicolored notes tab
    cy.dataCy(dataCy.tab.other).first().click();
    cy.dataCy(dataCy.note.note).should('have.length', multicoloredNotesCount);
  })
})
