import {dataCy, selectors} from "../../support/selectors";

describe('Localization', () => {
  it('should be localized in english, german, ukrainian', () => {
    cy.clean();

    // Default language should be english
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Switch language');

    // Localization in german should work
    cy.lang('de');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Sprache wechseln');

    // Localization in ukrainian should work
    cy.lang('ua');
    cy.visit('/');
    cy.dataCy(dataCy.common.buttons.settings).click();
    cy.get(selectors.menu).should('contain', 'Змінити мову');
  })
})
