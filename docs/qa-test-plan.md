# QA Test Plan - FisioFlow

| Propriedade | Valor |
|-------------|-------|
| Versão | 2.0 |
| Ambiente | API local (desenvolvimento) |
| Tipo de testes | Funcionais, validação de regras de negócio e regressão |
| Ferramentas | Postman, Cypress |

## Objetivo

Validar o funcionamento da API FisioFlow, garantindo:

- Integridade no cadastro de pacientes
- Consistência nos agendamentos
- Aplicação correta das regras de negócio
- Validação de entradas (campos obrigatórios, formatos e limites)
- Prevenção de conflitos de agenda

## Escopo

### Pacientes

- Criar paciente
- Listar pacientes
- Atualizar paciente (PATCH)
- Excluir paciente
- Validações de campos

### Agendamentos

- Criar agendamento
- Listar agendamentos
- Listar por data
- Regras de conflito de horário
- Validação de campos obrigatórios
- Validação de horários e duração

## Ambiente de Teste

| Recurso | Descrição |
|---------|-----------|
| URL | http://localhost:3000 |
| Banco de dados | Em memória (reset a cada execução) |
| Testes | Independentes entre si |
| Ferramentas | Postman (manual) e Cypress (automação) |

## Casos de Teste

### Pacientes

#### CT01 - Criar paciente válido

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Tipo | Positivo |
| Status esperado | 201 Created |
| Validações | Retorna id; Paciente criado com sucesso |

#### CT02 - Listar pacientes

| Campo | Valor |
|-------|-------|
| Severidade | Baixa |
| Tipo | Funcional |
| Status esperado | 200 OK |
| Validações | Retorna array de pacientes |

#### CT03 - Criar paciente sem nome

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Tipo | Negativo |
| Status esperado | 400 Bad Request |
| Validações | Mensagem: campo obrigatório |

#### CT04 - Idade inválida (0 ou negativa)

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 400 Bad Request |

#### CT05 - Idade acima do limite (120+)

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 400 Bad Request |

#### CT06 - Atualizar paciente (PATCH)

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 200 OK |
| Validações | Atualização parcial aplicada |

#### CT07 - Excluir paciente existente

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 200 OK |

#### CT08 - Excluir paciente inexistente

| Campo | Valor |
|-------|-------|
| Severidade | Médio |
| Status esperado | 404 Not Found |

#### CT19 - Idade limite mínima (1)

| Campo | Valor |
|-------|-------|
| Severidade | Médio |
| Tipo | Boundary |
| Status esperado | 201 Created |

#### CT20 - Idade limite máxima (120)

| Campo | Valor |
|-------|-------|
| Severidade | Médio |
| Tipo | Boundary |
| Status esperado | 201 Created |

### Agendamentos

#### CT09 - Criar agendamento válido

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Tipo | Positivo |
| Status esperado | 201 Created |
| Validações | endTime calculado corretamente |

#### CT10 - Campos obrigatórios ausentes

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 400 Bad Request |

#### CT11 - Paciente inexistente

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 404 Not Found |

#### CT12 - Conflito de horário

| Campo | Valor |
|-------|-------|
| Severidade | Crítico (regra principal) |
| Tipo | Negativo |
| Regra | newStart < existingEnd AND newEnd > existingStart |
| Status esperado | 409 Conflict |
| Resposta | `{ "message": "Schedule conflict detected" }` |

#### CT13 - Listar agendamentos

| Campo | Valor |
|-------|-------|
| Severidade | Baixa |
| Tipo | Funcional |
| Status esperado | 200 OK |
| Validações | Retorna array de agendamentos |

#### CT14 - Listar agendamentos por data

| Campo | Valor |
|-------|-------|
| Severidade | Baixa |
| Status esperado | 200 OK |

#### CT15 - Duração zero

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 400 Bad Request |

#### CT16 - Duração negativa

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Status esperado | 400 Bad Request |

#### CT17 - Formato de hora inválido

| Campo | Valor |
|-------|-------|
| Severidade | Crítico |
| Exemplo | "startTime": "25:00" |
| Status esperado | 400 Bad Request |

#### CT18 - Agendamento em data passada

| Campo | Valor |
|-------|-------|
| Severidade | Médio |
| Tipo | Funcional |
| Regra atual | Permitido |
| Status esperado | 201 Created |

## Regras de Negócio

### Pacientes

- Nome obrigatório
- Nome apenas com letras
- Idade entre 1 e 120 anos
- Telefone no formato `(XX) XXXXX-XXXX`

### Agendamentos

- Paciente deve existir
- Duração deve ser maior que 0
- Hora no formato `HH:MM`
- Não pode haver conflito de horário
- Datas passadas são permitidas (atualmente)

### Conflito de Horário

**Regra de detecção:**

```
newStart < existingEnd AND newEnd > existingStart
```

**Resposta (409 Conflict):**

```json
{
  "message": "Schedule conflict detected"
}
```

## Cobertura de Testes

- CRUD de pacientes
- CRUD de agendamentos
- Validações negativas e positivas
- Boundary testing (limites de valores)
- Regras de negócio críticas
- Integração entre entidades
- Detecção de conflito de agenda