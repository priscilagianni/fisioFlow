// tests/api/appointments.test.js
const request = require('supertest');
const { expect } = require('chai');
const app = require('../../src/app');

const TOMORROW = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
})();

const DAY_AFTER = (() => {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
})();

describe('API — Agendamentos', () => {
  let patientId;

  beforeEach(async () => {
    await request(app).delete('/test/reset');
    const res = await request(app)
      .post('/patients')
      .send({ name: 'Maria Souza', age: 42 });
    patientId = res.body.id;
  });

  // ===================== POST /appointments =====================

  describe('POST /appointments', () => {
    it('cria agendamento válido', async () => {
      const res = await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 50,
        type: 'Fisioterapia Ortopédica',
      });

      expect(res.status).to.equal(201);
      expect(res.body.patientName).to.equal('Maria Souza');
      expect(res.body.type).to.equal('Fisioterapia Ortopédica');
    });

    it('cria agendamento com observações', async () => {
      const res = await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 50,
        type: 'Avaliação',
        notes: 'Dor lombar crônica',
      });

      expect(res.status).to.equal(201);
      expect(res.body.notes).to.equal('Dor lombar crônica');
    });

    it('retorna 400 sem patientId', async () => {
      const res = await request(app).post('/appointments').send({
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 50,
        type: 'Retorno',
      });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('patientId');
    });

    it('retorna 400 com patientId inexistente', async () => {
      const res = await request(app).post('/appointments').send({
        patientId: 9999,
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 50,
        type: 'Retorno',
      });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('Paciente não encontrado');
    });

    it('retorna 400 com data passada', async () => {
      const res = await request(app).post('/appointments').send({
        patientId,
        date: '2020-01-01',
        time: '09:00',
        durationMinutes: 50,
        type: 'Retorno',
      });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('datas passadas');
    });

    it('retorna 400 com duração zero', async () => {
      const res = await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 0,
        type: 'Retorno',
      });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('maior que zero');
    });

    it('retorna 400 sem data', async () => {
      const res = await request(app).post('/appointments').send({
        patientId,
        time: '09:00',
        durationMinutes: 50,
        type: 'Retorno',
      });
      expect(res.status).to.equal(400);
      expect(res.body.error).to.include('date é obrigatório');
    });

    it('retorna 409 com conflito de horário (sobreposição)', async () => {
      await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 60,
        type: 'Avaliação',
      });

      const res = await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '09:30',
        durationMinutes: 50,
        type: 'Retorno',
      });
      expect(res.status).to.equal(409);
      expect(res.body.error).to.include('Conflito de horário');
    });

    it('permite agendamentos adjacentes sem sobreposição', async () => {
      await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 60,
        type: 'Avaliação',
      });

      const res = await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '10:00',
        durationMinutes: 50,
        type: 'Retorno',
      });
      expect(res.status).to.equal(201);
    });

    it('permite mesmo horário em dias diferentes', async () => {
      await request(app).post('/appointments').send({
        patientId,
        date: TOMORROW,
        time: '09:00',
        durationMinutes: 60,
        type: 'Avaliação',
      });

      const res = await request(app).post('/appointments').send({
        patientId,
        date: DAY_AFTER,
        time: '09:00',
        durationMinutes: 60,
        type: 'Retorno',
      });
      expect(res.status).to.equal(201);
    });
  });

  // ===================== GET /appointments =====================

  describe('GET /appointments', () => {
    it('retorna array vazio quando não há agendamentos', async () => {
      const res = await request(app).get('/appointments');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });

    it('retorna todos os agendamentos criados', async () => {
      await request(app).post('/appointments').send({
        patientId, date: TOMORROW, time: '09:00', durationMinutes: 50, type: 'Avaliação'
      });
      await request(app).post('/appointments').send({
        patientId, date: TOMORROW, time: '10:00', durationMinutes: 50, type: 'Retorno'
      });

      const res = await request(app).get('/appointments');
      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(2);
    });
  });

  // ===================== GET /appointments/day/:date =====================

  describe('GET /appointments/day/:date', () => {
    it('retorna agendamentos do dia correto', async () => {
      await request(app).post('/appointments').send({
        patientId, date: TOMORROW, time: '09:00', durationMinutes: 50, type: 'Avaliação'
      });
      await request(app).post('/appointments').send({
        patientId, date: DAY_AFTER, time: '10:00', durationMinutes: 50, type: 'Retorno'
      });

      const res = await request(app).get(`/appointments/day/${TOMORROW}`);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.length(1);
      expect(res.body[0].type).to.equal('Avaliação');
    });

    it('retorna array vazio para dia sem agendamentos', async () => {
      const res = await request(app).get('/appointments/day/2099-01-01');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal([]);
    });
  });

  // ===================== PUT /appointments/:id =====================

  describe('PUT /appointments/:id', () => {
    it('atualiza o tipo de atendimento', async () => {
      const created = await request(app).post('/appointments').send({
        patientId, date: TOMORROW, time: '09:00', durationMinutes: 50, type: 'Avaliação'
      });
      const id = created.body.id;

      const res = await request(app).put(`/appointments/${id}`).send({ type: 'Pilates Clínico' });
      expect(res.status).to.equal(200);
      expect(res.body.type).to.equal('Pilates Clínico');
      expect(res.body.date).to.equal(TOMORROW); // manteve
    });

    it('retorna 409 ao atualizar para horário com conflito', async () => {
      await request(app).post('/appointments').send({
        patientId, date: TOMORROW, time: '09:00', durationMinutes: 60, type: 'Avaliação'
      });
      const second = await request(app).post('/appointments').send({
        patientId, date: TOMORROW, time: '10:00', durationMinutes: 60, type: 'Retorno'
      });

      const res = await request(app)
        .put(`/appointments/${second.body.id}`)
        .send({ time: '09:30' });
      expect(res.status).to.equal(409);
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app).put('/appointments/9999').send({ type: 'Retorno' });
      expect(res.status).to.equal(404);
    });
  });

  // ===================== DELETE /appointments/:id =====================

  describe('DELETE /appointments/:id', () => {
    it('exclui agendamento existente', async () => {
      const created = await request(app).post('/appointments').send({
        patientId, date: TOMORROW, time: '09:00', durationMinutes: 50, type: 'Avaliação'
      });

      const res = await request(app).delete(`/appointments/${created.body.id}`);
      expect(res.status).to.equal(200);
      expect(res.body.message).to.include('sucesso');
    });

    it('retorna 404 para ID inexistente', async () => {
      const res = await request(app).delete('/appointments/9999');
      expect(res.status).to.equal(404);
    });
  });
});
