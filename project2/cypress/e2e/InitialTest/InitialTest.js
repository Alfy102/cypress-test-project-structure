import { When } from "@badeball/cypress-cucumber-preprocessor";

When("I do something that passed", () => {
    cy.log('Passing').wait(2000)
});