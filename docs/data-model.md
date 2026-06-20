# Data Model - FisioFlow

## Patient

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | number | Identificador numérico gerado automaticamente |
| name | string | Nome do paciente |
| phone | string (opcional) | Telefone no formato `(XX) XXXXX-XXXX` |
| age | number | Idade do paciente |
| diagnosis | string (opcional) | Diagnóstico |
| createdAt | string (ISO 8601) | Data de criação |

### Validações

- `name` é obrigatório
- `name` não pode conter números ou caracteres especiais
- `age` é obrigatória e deve ser um número entre 1 e 120
- `phone` é opcional, mas quando informado deve seguir o formato `(XX) XXXXX-XXXX`

### Regras de Comportamento

- Pacientes podem ser removidos via `DELETE /patients/{id}`
- Ao remover um paciente, todos os seus atendimentos são removidos automaticamente (exclusão em cascata)
- Dados são armazenados em memória (arrays)
- Ao reiniciar a API, todos os dados são perdidos

### Status Codes (Patient)

| Código | Significado |
|--------|------------|
| 201 | Criado com sucesso |
| 200 | Operação realizada com sucesso |
| 400 | Erro de validação |
| 404 | Paciente não encontrado |

---

## Appointment

### Campos

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | number | Identificador numérico gerado automaticamente |
| patientId | number | Referência ao paciente |
| date | string (YYYY-MM-DD) | Data do agendamento |
| startTime | string (HH:MM) | Horário inicial |
| duration | number | Duração em minutos |
| endTime | string (HH:MM) | Calculado automaticamente |
| createdAt | string (ISO 8601) | Data de criação |

### Validações

- `patientId` deve existir no sistema
- `date`, `startTime` e `duration` são obrigatórios
- `duration` deve ser um número positivo maior que zero
- `startTime` deve seguir o formato `HH:MM`
- Não pode haver conflito de horário no mesmo dia
- Não é permitido agendar em datas passadas

### Regras de Comportamento

- O `endTime` é calculado automaticamente `(startTime + duration)`
- Atendimentos são removidos automaticamente quando o paciente é deletado
- Não é permitido agendar dois atendimentos com sobreposição de horário no mesmo dia
- Dados são armazenados em memória (arrays)
- Ao reiniciar a API, todos os dados são perdidos

### Regra de Conflito de Horário

Um novo agendamento entra em conflito quando:

- seu horário inicial ocorre antes do término de outro agendamento, **E**
- seu horário final ocorre depois do início de outro agendamento

```
newStart < existingEnd AND newEnd > existingStart
```

### Status Codes (Appointment)

| Código | Significado |
|--------|------------|
| 201 | Criado com sucesso |
| 200 | Operações de consulta realizadas com sucesso |
| 400 | Erro de validação (dados inválidos) |
| 409 | Conflito de horário detectado |
| 404 | Paciente não encontrado |