// cypress/support/commands.js


Cypress.Commands.add('inicio', () => {
  cy.visit('/')
});

Cypress.Commands.add('entarNaPaginaParaCriarPaciente', ()=>{
    cy.contains('Pacientes').click()

    cy.get('#page-patients')
    .should('be.visible')
    
    cy.contains('button', '+ Novo Paciente')
      .should('be.visible')
      .click()

    cy.contains('h2', 'Novo Paciente')
      .should('be.visible')
})

Cypress.Commands.add('CadastarPaciente', (name, age, phone, diagnosis) => {
    cy.get('#patient-name').clear().type(name)
    cy.get('#patient-age').clear().type(age)
    cy.get('#patient-phone').clear().type(phone)
    cy.get('#patient-diagnosis').clear().type(diagnosis)
    cy.contains('button', 'Salvar Paciente')
      .should('be.visible')
      .click()

});

Cypress.Commands.add('entrarNaPaginaDeAgendamentoESelecionarAgendamento', ()=>{
    cy.contains('button', 'Agendamento')
            .should('exist')
            .click()

    cy.contains('button', '+ Novo Agendamento')
            .should('be.visible')
            .click()
    cy.get('#modal-appointment-title')
            .should('be.visible')
})

Cypress.Commands.add('criarAgendamentoDePaciente', (name, date, time, duration, type, notes) => {
  cy.get('#appointment-patient')
    .select(name)

  cy.get('#appointment-date')
    .type(date)

  cy.get('#appointment-time')
    .type(time)

  cy.get('#appointment-duration')
    .clear()
    .type(duration)

  cy.get('#appointment-type')
    .select(type)

  if (notes) {
    cy.get('#appointment-notes')
      .type(notes)
  }

  cy.contains('button', 'Salvar Agendamento')
    .click()
})







