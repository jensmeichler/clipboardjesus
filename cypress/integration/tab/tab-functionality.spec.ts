/// <reference types="cypress" />

import singleNoteTab from '../../fixtures/single-note.json';
import multipleNotesTab from '../../fixtures/multiple-notes.json';
import singleTaskListTab from "../../fixtures/single-task-list.json";
import {dataCy, selectors} from "../../support/selectors";

context('Tab functionality', () => {
  describe('Empty app', () => {
    beforeEach(() => {
      cy.visit('/');
    })

    it('should open context menu on right click', () => {
      cy.get(selectors.menu).should('not.exist');
      cy.dataCy(dataCy.tab.content).rightclick();
      cy.get(selectors.menu).should('be.visible');
    })

    it('should open about dialog on logo click', () => {
      cy.dataCy(dataCy.dialogs.about).should('not.exist');
      cy.dataCy(dataCy.common.logo).click();
      cy.dataCy(dataCy.dialogs.about).should('be.visible');
    })
  })

  describe('With many tabs', () => {
    beforeEach(() => {
      cy.seed([singleNoteTab, multipleNotesTab, singleTaskListTab]);
      cy.visit('/?tab=2');
    })

    it('should have the same count of tabs seeded', () => {
      cy.dataCy(dataCy.tab.active).should('have.length', 1);
      cy.dataCy(dataCy.tab.other).should('have.length', 2);
    })

    it('should have the second tab opened', () => {
      cy.dataCy(dataCy.tab.other).eq(0).should('contain', '1');
      cy.dataCy(dataCy.tab.active).should('contain', '2');
      cy.dataCy(dataCy.tab.other).eq(1).should('contain', '3');
    })
  })
})
