const db = require('../database/db');

function parseTime(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function hasConflict(date, time, durationMinutes, excludeId = null) {
  const newStart = parseTime(time);
  const newEnd = newStart + Number(durationMinutes);

  return db.appointments.some((a) => {
    if (excludeId && a.id === Number(excludeId)) return false;
    if (a.date !== date) return false;
    const existStart = parseTime(a.time);
    const existEnd = existStart + a.durationMinutes;
    return newStart < existEnd && newEnd > existStart;
  });
}

function validateAppointment(data, isUpdate = false, excludeId = null) {
  const errors = [];

  if (!isUpdate) {
    if (!data.patientId) errors.push('patientId é obrigatório.');
    if (!data.date) errors.push('date é obrigatório.');
    if (!data.time) errors.push('time é obrigatório.');
    if (data.durationMinutes === undefined || data.durationMinutes === null || data.durationMinutes === '')
      errors.push('durationMinutes é obrigatório.');
    if (!data.type) errors.push('type é obrigatório.');
  }

  if (data.patientId !== undefined) {
    const patient = db.patients.find((p) => p.id === Number(data.patientId));
    if (!patient) errors.push('Paciente não encontrado.');
  }

  if (data.date !== undefined) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const appointmentDate = new Date(data.date + 'T00:00:00');
    if (appointmentDate < today) errors.push('Não é permitido agendar em datas passadas.');
  }

  if (data.durationMinutes !== undefined && data.durationMinutes !== null && data.durationMinutes !== '') {
    if (Number(data.durationMinutes) <= 0) errors.push('Duração deve ser maior que zero.');
  }

  return errors;
}

function createAppointment(data) {
  const errors = validateAppointment(data);
  if (errors.length > 0) return { status: 400, body: { error: errors.join(' ') } };

  if (hasConflict(data.date, data.time, data.durationMinutes)) {
    return { status: 409, body: { error: 'Conflito de horário: já existe um agendamento nesse intervalo.' } };
  }

  const patient = db.patients.find((p) => p.id === Number(data.patientId));

  const appointment = {
    id: db.nextAppointmentId++,
    patientId: Number(data.patientId),
    patientName: patient.name,
    date: data.date,
    time: data.time,
    durationMinutes: Number(data.durationMinutes),
    type: data.type.trim(),
    notes: data.notes ? data.notes.trim() : null,
    createdAt: new Date().toISOString(),
  };

  db.appointments.push(appointment);
  return { status: 201, body: appointment };
}

function listAppointments() {
  return { status: 200, body: db.appointments };
}

function getAppointmentsByDay(date) {
  const result = db.appointments.filter((a) => a.date === date);
  return { status: 200, body: result };
}

function getAppointmentById(id) {
  const appt = db.appointments.find((a) => a.id === Number(id));
  if (!appt) return { status: 404, body: { error: 'Agendamento não encontrado.' } };
  return { status: 200, body: appt };
}

function updateAppointment(id, data) {
  const index = db.appointments.findIndex((a) => a.id === Number(id));
  if (index === -1) return { status: 404, body: { error: 'Agendamento não encontrado.' } };

  const current = db.appointments[index];
  const merged = {
    patientId: data.patientId !== undefined ? data.patientId : current.patientId,
    date: data.date !== undefined ? data.date : current.date,
    time: data.time !== undefined ? data.time : current.time,
    durationMinutes: data.durationMinutes !== undefined ? data.durationMinutes : current.durationMinutes,
    type: data.type !== undefined ? data.type : current.type,
    notes: data.notes !== undefined ? data.notes : current.notes,
  };

  const errors = validateAppointment(merged, true, id);
  if (errors.length > 0) return { status: 400, body: { error: errors.join(' ') } };

  if (hasConflict(merged.date, merged.time, merged.durationMinutes, id)) {
    return { status: 409, body: { error: 'Conflito de horário: já existe um agendamento nesse intervalo.' } };
  }

  const patient = db.patients.find((p) => p.id === Number(merged.patientId));

  db.appointments[index] = {
    ...current,
    patientId: Number(merged.patientId),
    patientName: patient ? patient.name : current.patientName,
    date: merged.date,
    time: merged.time,
    durationMinutes: Number(merged.durationMinutes),
    type: merged.type,
    notes: merged.notes ? merged.notes.trim() : null,
    updatedAt: new Date().toISOString(),
  };

  return { status: 200, body: db.appointments[index] };
}

function deleteAppointment(id) {
  const index = db.appointments.findIndex((a) => a.id === Number(id));
  if (index === -1) return { status: 404, body: { error: 'Agendamento não encontrado.' } };
  db.appointments.splice(index, 1);
  return { status: 200, body: { message: 'Agendamento removido com sucesso.' } };
}

module.exports = {
  createAppointment,
  listAppointments,
  getAppointmentsByDay,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};