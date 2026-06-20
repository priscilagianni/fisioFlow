# User Stories - FisioFlow

---

## Objetivo do sistema

Permitir:

- cadastro de pacientes  
- atualização de pacientes  
- remoção de pacientes  
- criação de atendimentos  
- controle de agenda  
- prevenção de conflitos de horário  

---

# User Stories

---

## US01 - Cadastrar pacientes

Como fisioterapeuta, eu quero cadastrar pacientes para organizar meus atendimentos.

### Critérios de aceitação:

- deve criar paciente com `id` gerado automaticamente  
- `name` é obrigatório  
- `name` não pode conter números ou caracteres especiais  
- `age` é obrigatória e deve ser um número entre **1 e 120**  
- `phone` é opcional  
- quando `phone` for informado, deve seguir o formato `(XX) XXXXX-XXXX`  
- deve retornar status `201` em caso de sucesso  
- deve retornar status `400` em caso de dados inválidos  

### Relacionamento:

- Endpoint: `POST /patients`  
- Testes: CT01, CT03, CT04, CT05  

---

## US02 - Visualizar lista de pacientes

Como fisioterapeuta, eu quero visualizar a lista de pacientes.

### Critérios de aceitação:

- deve retornar todos os pacientes cadastrados  
- deve retornar um array (mesmo vazio)  
- deve retornar status `200`  

### Relacionamento:

- Endpoint: `GET /patients`  
- Testes: CT02  

---

## US03 - Atualizar paciente (PATCH)

Como fisioterapeuta, eu quero atualizar dados de um paciente para manter suas informações corretas.

### Critérios de aceitação:

- deve permitir atualização parcial dos dados  
- paciente deve existir no sistema  
- apenas os campos enviados devem ser atualizados  
- validações devem ser aplicadas apenas nos campos informados:
  - `name`: obrigatório quando enviado, sem números ou caracteres especiais  
  - `age`: deve ser número entre 1 e 120 quando enviado  
  - `phone`: deve seguir formato `(XX) XXXXX-XXXX` quando enviado  
- deve retornar status `200` em caso de sucesso  
- deve retornar status `404` se paciente não existir  

### Relacionamento:

- Endpoint: `PATCH /patients/{id}`  
- Testes: CT06, CT15  

---

## US04 - Remover paciente

Como fisioterapeuta, eu quero remover um paciente para manter o sistema atualizado.

### Critérios de aceitação:

- deve remover o paciente pelo `id`  
- deve retornar status `200` quando removido com sucesso  
- deve retornar status `404` quando o paciente não existir  
- ao remover um paciente, todos os seus atendimentos devem ser removidos automaticamente (exclusão em cascata)  
- não pode existir atendimento sem paciente válido  

### Relacionamento:

- Endpoint: `DELETE /patients/{id}`  
- Testes: CT07, CT08  

---

## US05 - Agendar sessões

Como fisioterapeuta, eu quero agendar sessões com data, horário e duração.

### Critérios de aceitação:

- `patientId`, `date`, `startTime` e `duration` são obrigatórios  
- `patientId` deve existir no sistema  
- `date` deve estar no formato `YYYY-MM-DD`  
- `startTime` deve estar no formato `HH:MM`  
- `duration` deve ser maior que zero  
- deve calcular automaticamente o `endTime`  
- deve retornar status `201` em caso de sucesso  
- deve retornar status `400` em caso de dados inválidos  

### Relacionamento:

- Endpoint: `POST /appointments`  
- Testes: CT09, CT10  

---

## US06 - Evitar conflitos de horário

Como fisioterapeuta, eu quero evitar agendar dois atendimentos no mesmo horário.

### Critérios de aceitação:

- não permitir sobreposição de atendimentos no mesmo dia  
- conflito ocorre quando:  
  `newStart < existingEnd AND newEnd > existingStart`  
- deve retornar status `409` (Conflict) em caso de conflito  
- deve retornar mensagem: `Conflito de horario detectado`  

### Relacionamento:

- Endpoint: `POST /appointments`  
- Testes: CT12  

---

## US07 - Visualizar atendimentos do dia

Como fisioterapeuta, eu quero visualizar todos os atendimentos do dia.

### Critérios de aceitação:

- deve retornar apenas atendimentos da data informada  
- deve retornar um array (mesmo vazio)  
- deve aceitar data no formato `YYYY-MM-DD`  
- deve retornar status `200`  

### Relacionamento:

- Endpoint: `GET /appointments/day/{date}`  
- Testes: CT13, CT14  

---

# Regras de negócio globais

- nome do paciente é obrigatório  
- nome não pode conter números ou caracteres especiais  
- idade deve ser número entre 1 e 120  
- telefone, é opcional e quando informado, deve seguir o formato `(XX) XXXXX-XXXX`  
- atualização de paciente pode ser parcial (PATCH)  
- não pode existir sobreposição de horários no mesmo dia  
- ao deletar um paciente, todos os seus atendimentos devem ser removidos automaticamente  
- não pode existir atendimento sem paciente válido  
- nao sera aceita datas passadas