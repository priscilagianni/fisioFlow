const appointmentService = require('../services/appointmentService');

const create = (req, res) => {
  const result = appointmentService.createAppointment(req.body);
  res.status(result.status).json(result.body);
};

const list = (req, res) => {
  const result = appointmentService.listAppointments();
  res.status(result.status).json(result.body);
};

const getByDay = (req, res) => {
  const result = appointmentService.getAppointmentsByDay(req.params.date);
  res.status(result.status).json(result.body);
};

const getById = (req, res) => {
  const result = appointmentService.getAppointmentById(req.params.id);
  res.status(result.status).json(result.body);
};

const update = (req, res) => {
  const result = appointmentService.updateAppointment(req.params.id, req.body);
  res.status(result.status).json(result.body);
};

const remove = (req, res) => {
  const result = appointmentService.deleteAppointment(req.params.id);
  res.status(result.status).json(result.body);
};

module.exports = { create, list, getByDay, getById, update, remove };