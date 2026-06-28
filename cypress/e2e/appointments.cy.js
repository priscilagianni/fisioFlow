describe('Agendamento', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('Deve clicar no botão de agendamento e abrir a página de agendamento', () => {
        cy.contains('button', 'Agendamento')
            .should('exist')
            .click()

        cy.contains('h1', 'Agendamentos')
            .should('be.visible')
    })

    it('Deve aparecer o contador de agendamento registrado vazio, quando não tiver nenhum agendamento cadastrado', () => {
        cy.get('#patients-count')
            .should('have.text', '0')
    })

    it('Deve aparecer o contador de agendamento de hoje vazio, quando não tiver nenhum agendamento cadastrado', () => {
        cy.get('#appointments-today')
            .should('have.text', '0')
    })

    it('Deve criar um agendamento válido preenchendo campos obrigatórios clicando no botão + Novo Agendamento', () => {
        cy.entarNaPaginaParaCriarPaciente()
        cy.CadastarPaciente('Martina', '50', '(99) 99999-9999', 'Dor')
        cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()
        cy.criarAgendamentoDePaciente('Martina', '2026-06-20', '15:00', '55', 'Avaliação', 'me liga')

        cy.get('#appointments-count')
            .invoke('text')
            .should((text) => {
                expect(Number(text.trim())).to.be.greaterThan(0)
            })

        cy.get('#toast')
            .should('be.visible')
            .and('contain', 'Agendamento criado!')
    })

    it('Deve filtra agendamentos por dia', () => {
        cy.contains('button', 'Agendamento')
            .should('exist')
            .click()

        cy.get('#filter-date')
            .should('be.visible')
            .type('2026-06-17')

        cy.get('.btn-secondary')
            .click()

        cy.contains('h2', 'Lista de Agendamentos')
            .should('be.visible')
    })

    it('Deve exibe erro ao salvar agendamento sem paciente selecionado', () => {
        cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()

        cy.contains('button', 'Salvar Agendamento')
            .should('exist')
            .click()

        cy.get('#appointment-error')
            .should('be.visible')
            .and('have.text', 'patientId é obrigatório. date é obrigatório. time é obrigatório. type é obrigatório. Paciente não encontrado.')
    })

    it('Deve exibe mensagem de erro ao agendar em data passada', () => {
        cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()

        cy.criarAgendamentoDePaciente('Martina', '2025-05-20', '10:00', '55', 'Avaliação')

        cy.get('#appointment-error')
            .should('be.visible')
            .and('have.text', 'Não é permitido agendar em datas passadas.')
    })

    it('Deve validar conflito de horário ao criar agendamento', () => {
        cy.entarNaPaginaParaCriarPaciente()
        cy.CadastarPaciente('Pedro', '50', '(99) 99999-9999', 'Dor')

        cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()
        cy.criarAgendamentoDePaciente('Pedro', '2026-07-20', '10:00', '55', 'Avaliação')

        cy.contains('Agendamento criado!')
            .should('be.visible')

        cy.contains('button', '+ Novo Paciente')
            .should('exist')
            .then(() => {
                cy.log('Botão encontrado')
            })

        cy.entarNaPaginaParaCriarPaciente()
        cy.CadastarPaciente('Marta', '50', '(99) 99999-9999', 'Dor')

        cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()
        cy.criarAgendamentoDePaciente('Marta', '2026-07-20', '10:00', '55', 'Avaliação')

        cy.get('#appointment-error')
            .should('be.visible')
            .and('contain', 'Conflito de horário')
    })

    it('Deve Limpar filtro e exibe todos os agendamentos', () => {
        cy.contains('button', 'Agendamento')
            .should('exist')
            .click()

        cy.get('#filter-date')
            .should('be.visible')
            .type('2026-06-17')

        cy.contains('button', 'Limpar filtro')
            .should('exist')
            .click()

        cy.get('#filter-date')
            .should('have.text', '')
    })

    it('Deve edita um agendamento existente e valida atualização na lista', () => {
        cy.entarNaPaginaParaCriarPaciente()
        cy.CadastarPaciente('Lu', '40', '(99) 99999-9999', 'Dor')

        cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()
        cy.criarAgendamentoDePaciente('Lu', '2026-08-10', '22:00', '45', 'Avaliação')

        cy.contains('h2', 'Lista de Agendamentos')
            .should('be.visible')

        cy.get('#appointments-list')
            .contains('.item-name', 'Lu')
            .parents('.item-row')
            .within(() => {
                cy.contains('button', 'Editar')
                    .click()
            })

        cy.get('#appointment-date')
            .type('2026-06-30')

        cy.get('#appointment-time')
            .type('20:00')

        cy.get('#appointment-duration')
            .clear()
            .type('40')

        cy.get('#appointment-type')
            .select('Avaliação')

        cy.contains('button', 'Salvar Agendamento')
            .click()

        cy.contains('#toast', 'Agendamento atualizado!')
            .should('be.visible')

        cy.get('#appointments-list')
            .should('contain', 'Lu')
    })

    it('Deve excluir um agendamento e validar remoção e contador', () => {
        cy.entarNaPaginaParaCriarPaciente()
        cy.CadastarPaciente('Nay', '40', '(99) 99999-9999', 'Dor')

        cy.entrarNaPaginaDeAgendamentoESelecionarAgendamento()

        cy.criarAgendamentoDePaciente('Nay', '2026-08-10', '22:00', '45', 'Avaliação')

        cy.contains('h2', 'Lista de Agendamentos')
            .should('be.visible')

        cy.get('#page-appointments')
            .should('be.visible')

        cy.get('#appointments-list')
            .contains('.item-name', 'Nay')
            .parents('.item-row')
            .within(() => {
                cy.contains('button', 'Excluir')
                    .click()
            })

        cy.get('#confirm-message')
            .should('have.text', 'Excluir agendamento de "Nay"? Esta ação não pode ser desfeita.')

        cy.get('.btn-danger')
            .click()

        cy.get('#toast')
            .should('be.visible')
            .and('contain', 'Agendamento removido.')

        cy.get('#appointments-count')
            .should('have.text', '0')
    })
})


