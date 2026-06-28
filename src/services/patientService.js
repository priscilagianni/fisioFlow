const db = require('../database/db');

function validatePatient(data) {
  const errors = [];

  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    errors.push('Nome é obrigatório.');
  } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(data.name.trim())) {
    errors.push('Nome deve conter apenas letras.');
  }

  if (data.age === undefined || data.age === null || data.age === '') {
    errors.push('Idade é obrigatória.');
  } else {
    const age = Number(data.age);
    if (!Number.isInteger(age) || age < 1 || age > 120) {
      errors.push('Idade deve ser um número inteiro entre 1 e 120.');
    }
  }

  if (data.phone !== undefined && data.phone !== null && data.phone !== '') {
    if (typeof data.phone !== 'string' || !/^[\d\s\-\(\)\+]+$/.test(data.phone)) {
      errors.push('Telefone inválido.');
    }
  }

  return errors;
}

function createPatient(data) {
  const errors = validatePatient(data);
  if (errors.length > 0) return { status: 400, body: { error: errors.join(' ') } };

  const patient = {
    id: db.nextPatientId++,
    name: data.name.trim(),
    age: Number(data.age),
    phone: data.phone ? data.phone.trim() : null,
    diagnosis: data.diagnosis ? data.diagnosis.trim() : null,
    createdAt: new Date().toISOString(),
  };

  db.patients.push(patient);
  return { status: 201, body: patient };
}

function listPatients() {
  return { status: 200, body: db.patients };
}

function getPatientById(id) {
  const patient = db.patients.find((p) => p.id === Number(id));
  if (!patient) return { status: 404, body: { error: 'Paciente não encontrado.' } };
  return { status: 200, body: patient };
}

function updatePatient(id, data) {
  const index = db.patients.findIndex((p) => p.id === Number(id));
  if (index === -1) return { status: 404, body: { error: 'Paciente não encontrado.' } };

  const current = db.patients[index];
  const merged = {
    name: data.name !== undefined ? data.name : current.name,
    age: data.age !== undefined ? data.age : current.age,
    phone: data.phone !== undefined ? data.phone : current.phone,
    diagnosis: data.diagnosis !== undefined ? data.diagnosis : current.diagnosis,
  };

  const errors = validatePatient(merged);
  if (errors.length > 0) return { status: 400, body: { error: errors.join(' ') } };

  db.patients[index] = {
    ...current,
    name: merged.name.trim(),
    age: Number(merged.age),
    phone: merged.phone ? merged.phone.trim() : null,
    diagnosis: merged.diagnosis ? merged.diagnosis.trim() : null,
    updatedAt: new Date().toISOString(),
  };

  return { status: 200, body: db.patients[index] };
}

function deletePatient(id) {
  const index = db.patients.findIndex((p) => p.id === Number(id));
  if (index === -1) return { status: 404, body: { error: 'Paciente não encontrado.' } };

  const hasAppointments = db.appointments.some((a) => a.patientId === Number(id));
  if (hasAppointments) {
    return {
      status: 409,
      body: { error: 'Não é possível remover o paciente pois ele possui agendamentos.' },
    };
  }

  db.patients.splice(index, 1);
  return { status: 200, body: { message: 'Paciente removido com sucesso.' } };
}

module.exports = { createPatient, listPatients, getPatientById, updatePatient, deletePatient };