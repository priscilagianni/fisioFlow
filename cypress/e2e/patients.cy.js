describe('Pacientes', () => {
    beforeEach(() => {
    cy.inicio('/')
    })

    it('Deve exibir contador vazio quando não há pacientes', () => {
        cy.get('#patients-count')
        .should('have.text', '0')
    })

    it('Deve cadastrar paciente clicando cadastrar paciente', () => {
        cy.contains('p', 'Nenhum paciente cadastrado.')
            .should('be.visible')

        cy.contains('button', 'Cadastrar paciente')
            .should('exist')
            .click()

        cy.contains('h2', 'Novo Paciente')
            .should('be.visible')
        })

    it('Deve cadastrar paciente clicando no botão + Novo Paciente', () => {
        cy.entarNaPaginaParaCriarPaciente()
    })

    it('Deve fechar o modal ao clicar em Cancelar', () => {
        cy.entarNaPaginaParaCriarPaciente()

        cy.contains('button', 'Cancelar')
        .should('exist')
        .click()

        cy.contains('h1', 'Pacientes')
        .should('be.visible')
    })

    it('Deve fechar o modal ao clicar em X', () => {
        cy.entarNaPaginaParaCriarPaciente()

        cy.contains('button', '×')
        .should('exist')
        .click()

        cy.contains('h1', 'Pacientes')
        .should('be.visible')
    })

    it('Deve cadastrar paciente com credenciais válidas', () => {
        cy.entarNaPaginaParaCriarPaciente()
        cy.CadastarPaciente('Sophia', '9', '(99) 99999-9999', 'Dor')

        cy.contains('#toast', 'Paciente')
        .should('be.visible')
    })

    it('Deve editar um paciente cadastrado', () => {
        cy.entarNaPaginaParaCriarPaciente()
        cy.CadastarPaciente('Louyse', '20', '(99) 99999-9999', 'Dor')

        cy.contains('h2', 'Lista de Pacientes')
            .should('be.visible')

        cy.get('.search-input')
            .type('Louyse')
            .should('be.visible')

        cy.contains('button', 'Editar')
            .first()
            .should('be.visible')
            .click()

        cy.get('#modal-patient')
            .should('be.visible')

        cy.CadastarPaciente('Sophia', '9', '(99) 99999-9999', 'Dor')

        cy.contains('#toast', 'Paciente atualizado')
            .should('be.visible')
    })

    it('Deve apresentar mensagem de erro ao tentar salvar sem nome', () => {
        cy.contains('button', '+ Novo Paciente')
            .click()

        cy.get('#patient-age')
            .clear()
            .type('10')

        cy.contains('button', 'Salvar Paciente')
            .click()

        cy.get('#patient-error')
            .should('be.visible')
            .and('contain.text', 'Nome é obrigatório.')
    })

    it('Deve apresentar mensgame de erro ao informar nome com números', () => {
        cy.contains('button', '+ Novo Paciente')
            .click()

        cy.get('#patient-name')
            .type('Sophia123')

    cy.get('#patient-age')
      .type('50')

    cy.contains('button', 'Salvar Paciente')
      .click()

    cy.get('#patient-error')
      .should('have.text', 'Nome deve conter apenas letras.')
  })

  it('Deve apresentar mensagem de erro ao preencher o campo idade com 0', () => {
    cy.entarNaPaginaParaCriarPaciente()
    cy.CadastarPaciente('Sophia', '0', '(99) 99999-9999', 'dor')

    cy.get('#patient-error')
      .should('have.text', 'Idade deve ser um número inteiro entre 1 e 120.')
  })

  it('Deve apresentar mensagem de erro ao preencher o campo idade com 121', () => {
    cy.entarNaPaginaParaCriarPaciente()
    cy.CadastarPaciente('Sophia', '121', '(99) 99999-9999', 'dor')

    cy.get('#patient-error')
      .should('have.text', 'Idade deve ser um número inteiro entre 1 e 120.')
  })

  it('Deve filtra pacientes pela busca por nome', () => {
    cy.entarNaPaginaParaCriarPaciente()
    cy.CadastarPaciente('Mel', '12', '(99) 99999-9999', 'Dor')

    cy.get('.search-input')
      .type('Mel')
      .should('be.visible')
  })

  it('Deve lista múltiplos pacientes e valida o contador e badge', () => {
    const pacientes = [
      { nome: 'Mel', idade: '10' },
      { nome: 'Sophia', idade: '20' },
      { nome: 'Lila', idade: '30' },
    ]

    pacientes.forEach((paciente) => {
      cy.entarNaPaginaParaCriarPaciente()

      cy.CadastarPaciente(
        paciente.nome,
        paciente.idade,
        '(99) 99999-9999',
        'Dor'
      )
    })

    cy.get('#patients-count')
      .should('have.text', '3')

    cy.contains('.item-name', 'Mel')
      .should('be.visible')

    cy.contains('.item-name', 'Sophia')
      .should('be.visible')

    cy.contains('.item-name', 'Lila')
      .should('be.visible')
  })

  it('Deve excluir paciente cadastrado', () => {
    cy.entarNaPaginaParaCriarPaciente()
    cy.CadastarPaciente('lila', '21', '(99) 99999-9999', 'Dor')

    cy.contains('button', 'Excluir')
      .should('be.visible')
      .click()

    cy.get('#modal-confirm')
      .should('be.visible')
      .within(() => {
        cy.contains('h2', 'Confirmar exclusão')
          .should('be.visible')

        cy.get('#confirm-message')
          .should('contain.text', 'Excluir paciente')

        cy.contains('button', 'Excluir')
          .should('be.visible')
          .click()
      })

    cy.contains('#toast', 'Paciente removido')
      .should('be.visible')
  })
  it('Não permite excluir paciente com agendamentos vinculados', ()=>{
    cy.entarNaPaginaParaCriarPaciente()
    cy.CadastarPaciente('Raul', '55', '(99) 99999-9999', 'Artralgia')
    cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()
    cy.criarAgendamentoDePaciente('Raul', '2026-08-30', '22:00', '45', 'Avaliação')
    cy.contains('h2', 'Lista de Agendamentos')
            .should('be.visible')
    cy.get('#page-appointments')
            .should('be.visible')
    cy.contains('Pacientes').click()

    cy.get('#page-patients')
    .should('be.visible')

    cy.contains('h2', 'Lista de Pacientes')
      .should('be.visible')

    cy.contains('button', 'Excluir')
      .should('be.visible')
      .click()

    cy.get('#confirm-message')
      .should('have.text', 'Excluir paciente "Raul"? Esta ação não pode ser desfeita.')
    
    cy.get('.btn-danger')
      .should('be.visible')
      .click()

    cy.contains('#toast', 'Não é possível remover o paciente pois ele possui agendamentos.')
      .should('be.visible')
        
  })

})
