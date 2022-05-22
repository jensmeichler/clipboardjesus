// noinspection JSCheckFunctionSignatures
Cypress.Commands.add('seed', (tabs) => {
  let i = 0;
  tabs.forEach(tab => {
    const json = JSON.stringify(tab);
    window.localStorage.setItem(`clipboard_data_${i++}`, json);
  });
})

// noinspection JSCheckFunctionSignatures
Cypress.Commands.add('dataCy', (dataCy) => {
  return cy.get(`[data-cy=${dataCy}]`);
})

// noinspection JSCheckFunctionSignatures
Cypress.Commands.add('lang', (lang) => {
  if (lang === 'en') return;
  window.localStorage.setItem('language', lang);
})
