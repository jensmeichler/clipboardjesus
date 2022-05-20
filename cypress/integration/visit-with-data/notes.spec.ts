/// <reference types="cypress" />
import {Tab} from "../../../src/app/models";

context('Notes tests', () => {
  beforeEach(() => {
    const testData: Tab[] = [{
      index: 0,
      color: "#131313",
      notes: [{
          foregroundColor: "#ffffff",
          backgroundColor: "#212121",
          posX: 80,
          posY: 100,
          posZ: 1,
          content: "test"
        }]
    }];

    cy.seed(testData);
    cy.visit('/')
  })

  describe('Layout checks', () => {
  })

  describe('Functionality checks', () => {
    it('should open new note dialog on context menu selection', () => {

    })
  })
})
