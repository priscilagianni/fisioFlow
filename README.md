# FisioFlow

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-blue)](https://expressjs.com/)
[![Cypress](https://img.shields.io/badge/Cypress-14-brightgreen)](https://www.cypress.io/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](#licença)

Sistema fullstack para gerenciamento de pacientes e agendamentos de fisioterapia.

---

## Sobre o projeto

FisioFlow é uma aplicação completa com:

- **API REST** com validação de regras de negócio
- **Interface web** em duas páginas (Pacientes e Agendamentos)
- **Testes automatizados** de API (Mocha + Supertest) e E2E (Cypress)
- **Documentação** com Swagger

---

## Requisitos

- Node.js 18+

---

## Instalação e execução

```bash
git clone https://github.com/priscilagianni/fisioFlow
cd fisioFlow
npm install
npm run dev
```

Após iniciar:

| Serviço   | Descrição                        | URL |
|----------|----------------------------------|-----|
| Frontend | Interface web         | http://localhost:3000 |
| API      | Backend REST          | http://localhost:3000/patients /appointments |
| Swagger  | Documentação da API     | http://localhost:3000/api-docs |

---

## Testes

```bash
# Testes de API (Mocha + Supertest)
npm run test:api

# Cypress modo interativo
npm run cy:open

# Cypress modo headless
npm run cy:run

# Gerar relatório HTML (após cy:run)
npm run test:report
```

---

## Estrutura do projeto

```
fisioFlow-Api/
├── src/
│   ├── app.js                    # Express app
│   ├── server.js                 # Entry point
│   ├── controllers/
│   │   ├── patientController.js
│   │   └── appointmentController.js
│   ├── services/
│   │   ├── patientService.js     # Regras de negócio
│   │   └── appointmentService.js # Regras de negócio
│   ├── routes/
│   │   ├── patientRoutes.js
│   │   └── appointmentRoutes.js
│   └── database/
│       └── db.js                 # Armazenamento em memória
├── front-end/
│   └── public/
│       ├── index.html            # SPA com duas páginas
│       ├── app.js                # CRUD completo via fetch
│       └── styles.css            # Design system verde
├── cypress/
│   ├── e2e/
│   │   ├── patients.cy.js        # Testes E2E de pacientes
│   │   └── appointments.cy.js    # Testes E2E de agendamentos
│   └── support/
│       ├── commands.js           # Comandos customizados
│       └── e2e.js
├── tests/
│   └── api/
│       ├── patients.test.js      # Testes de API (Mocha)
│       └── appointments.test.js  # Testes de API (Mocha)
├── docs/
│   └── swagger.yaml              # Documentação OpenAPI 3.0
├── postman/
│   └── FisioFlow.postman_collection.json
├── cypress.config.js
├── package.json
└── README.md
```

---

## Endpoints

### Pacientes

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/patients` | Criar paciente |
| `GET` | `/patients` | Listar todos os pacientes |
| `GET` | `/patients/:id` | Buscar paciente por ID |
| `PUT` | `/patients/:id` | Atualizar paciente |
| `DELETE` | `/patients/:id` | Excluir paciente |

### Agendamentos

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/appointments` | Criar agendamento |
| `GET` | `/appointments` | Listar todos os agendamentos |
| `GET` | `/appointments/day/:date` | Agendamentos por dia (YYYY-MM-DD) |
| `GET` | `/appointments/:id` | Buscar agendamento por ID |
| `PUT` | `/appointments/:id` | Atualizar agendamento |
| `DELETE` | `/appointments/:id` | Excluir agendamento |


## Regras de negócio

### Pacientes

| Campo | Regra |
|---|---|
| `name` | Obrigatório; somente letras e espaços |
| `age` | Obrigatório; inteiro entre 1 e 120 |
| `phone` | Opcional |
| `diagnosis` | Opcional |
| Exclusão | Bloqueada se o paciente tiver agendamentos (409) |

### Agendamentos

| Campo | Regra |
|---|---|
| `patientId` | Obrigatório; paciente deve existir |
| `date` | Obrigatório; não pode ser data passada |
| `time` | Obrigatório; formato HH:MM |
| `durationMinutes` | Obrigatório; maior que zero |
| `type` | Obrigatório |
| `notes` | Opcional |
| Conflito | Bloqueado quando há sobreposição de horário no mesmo dia (409) |

---

## Arquitetura

```
Request → Routes → Controllers → Services → Response
                                     ↕
                                  Database (in-memory)
```

| Camada | Responsabilidade |
|---|---|
| Routes | Define endpoints e delega para controllers |
| Controllers | Recebe requisição, chama service, devolve resposta |
| Services | Valida dados e aplica regras de negócio |
| Database | Armazenamento em memória (arrays + contadores de ID) |

---

## Estratégia de testes

- Testes E2E: Cypress
- Testes de API: Mocha + Supertest
- Cobertura:
- Fluxo de pacientes
- Fluxo de agendamentos
- Validações de regra de negócio

  ## Status Codes

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado com sucesso |
| 400 | Erro de validação |
| 404 | Recurso não encontrado |
| 409 | Conflito de regra de negócio |
| 500 | Erro interno do servidor |

## Postman

Importe o arquivo `postman/FisioFlow.postman_collection.json` no Postman.

Antes de rodar as requisições de agendamento, atualize a variável `tomorrow` para uma data futura válida no formato `YYYY-MM-DD`.

---

## Troubleshooting

**Porta 3000 em uso (Windows)**

```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Frontend não carrega dados**

- Confirme que o backend está rodando em http://localhost:3000
- Abra o DevTools → Console e verifique erros de rede

---

## Melhorias futuras

- Banco de dados persistente (PostgreSQL ou MongoDB)
- Autenticação JWT
- Docker + docker-compose
- CI/CD com GitHub Actions
- Deploy em nuvem
- Testes de contrato (Pact)
- Relatório de atendimentos por paciente

---

## Autora

Priscila Gianni

---

## Licença

MIT
