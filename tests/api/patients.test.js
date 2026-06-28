// tests/api/patients.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');

describe('API — Pacientes', () => {
  beforeEach(async () => {
    await request(app).delete('/test/reset');
  });

  // ===================== POST /patients =====================

  describe('POST /patients', () => {
    it('cria paciente com campos obrigatórios', async () => {
      const res = await request(app)
        .post('/patients')
        .send({ name: 'Maria Souza', age: 42 });

      expect(res.status).to.equal(201);
      expect(res.body).to.include({ name: 'Maria Souza', age: 42 });
      expect(res.body.id).to.be.a('number');
      expect(res.body.createdAt).to.be.a('string');
    });

    it('cria paciente com todos os campos', async () => {
      const res = await request(app)
        .post('/patients')
        .send({ name: 'João Silva', age: 35, phone: '(81) 99999-0001', diagnosis: 'Lombalgia' });

      expect(res.status).to.equal(201);
      expect(res.body.phone).to.equal('(81) 99999-0001');
      expect(res.body.diagnosis).to.equal('Lombalgia');
    });

    it('retorna 400 sem nome', async () => {
      const res = await request(app).post('/patients').send({ age: 30 });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Nome é obrigatório');
    });

    it('retorna 400 com nome contendo números', async () => {
      const res = await request(app).post('/patients').send({ name: 'Maria123', age: 30 });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('apenas letras');
    });

    it('retorna 400 sem idade', async () => {
      const res = await request(app).post('/patients').send({ name: 'Ana Lima' });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Idade é obrigatória');
    });

    it('retorna 400 com idade 0', async () => {
      const res = await request(app).post('/patients').send({ name: 'Ana Lima', age: 0 });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('entre 1 e 120');
    });

    it('retorna 400 com idade acima de 120', async () => {
      const res = await request(app).post('/patients').send({ name: 'Ana Lima', age: 121 });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('entre 1 e 120');
    });

    it('aceita nome com acentos e espaços', async () => {
      const res = await request(app).post('/patients').send({ name: 'Ângela Mária', age: 50 });
      expect(res.status).to.equal(201);
    });
  });

  // ===================== GET /patients =====================

  describe('GET /patients', () => {
    it('retorna array vazio quando não há pacientes', async () => {
      const res = await request(app).get('/patients');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });

    it('retorna lista com pacientes criados', async () => {
      await request(app).post('/patients').send({ name: 'Ana', age: 30 });
      await request(app).post('/patients').send({ name: 'Bruno', age: 25 });

      const res = await request(app).get('/patients');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(2);
    });
  });

  // ===================== GET /patients/:id =====================

  describe('GET /patients/:id', () => {
    it('retorna o paciente correto pelo ID', async () => {
      const created = await request(app).post('/patients').send({ name: 'Carlos', age: 55 });
      const id = created.body.id;

      const res = await request(app).get(`/patients/${id}`);
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal('Carlos');
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app).get('/patients/9999');
      expect(res.status).to.equal(404);
    });
  });

  // ===================== PUT /patients/:id =====================

  describe('PUT /patients/:id', () => {
    it('atualiza o nome do paciente', async () => {
      const created = await request(app).post('/patients').send({ name: 'Lucas', age: 28 });
      const id = created.body.id;

      const res = await request(app).put(`/patients/${id}`).send({ name: 'Lucas Santos' });
      expect(res.status).to.equal(200);
      expect(res.body.name).to.equal('Lucas Santos');
      expect(res.body.updatedAt).to.be.a('string');
    });

    it('atualiza apenas o telefone', async () => {
      const created = await request(app).post('/patients').send({ name: 'Lia', age: 40 });
      const id = created.body.id;

      const res = await request(app).put(`/patients/${id}`).send({ phone: '(81) 98000-1234' });
      expect(res.status).to.equal(200);
      expect(res.body.phone).to.equal('(81) 98000-1234');
      expect(res.body.name).to.equal('Lia'); // manteve
    });

    it('retorna 400 ao atualizar com nome inválido', async () => {
      const created = await request(app).post('/patients').send({ name: 'Lia', age: 40 });
      const res = await request(app).put(`/patients/${created.body.id}`).send({ name: 'Lia123' });
      expect(res.status).to.equal(400);
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app).put('/patients/9999').send({ name: 'Teste' });
      expect(res.status).to.equal(404);
    });
  });

  // ===================== DELETE /patients/:id =====================

  describe('DELETE /patients/:id', () => {
    it('exclui um paciente sem agendamentos', async () => {
      const created = await request(app).post('/patients').send({ name: 'Vera', age: 60 });
      const id = created.body.id;

      const res = await request(app).delete(`/patients/${id}`);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('sucesso');
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app).delete('/patients/9999');
      expect(res.status).to.equal(404);
    });

    it('retorna 409 ao excluir paciente com agendamentos', async () => {
      const patient = await request(app).post('/patients').send({ name: 'Paulo', age: 38 });
      const patientId = patient.body.id;

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const date = tomorrow.toISOString().split('T')[0];

      await request(app).post('/appointments').send({
        patientId,
        date,
        time: '09:00',
        durationMinutes: 50,
        type: 'Retorno',
      });

      const res = await request(app).delete(`/patients/${patientId}`);
      expect(res.status).to.equal(409);
      expect(res.body.error).to.include('agendamentos');
    });
  });
});

