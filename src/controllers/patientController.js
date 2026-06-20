const patientService = require('../services/patientService');

const create = (req, res) => {
  const result = patientService.createPatient(req.body);
  res.status(result.status).json(result.body);
};

const list = (req, res) => {
  const result = patientService.listPatients();
  res.status(result.status).json(result.body);
};

const getById = (req, res) => {
  const result = patientService.getPatientById(req.params.id);
  res.status(result.status).json(result.body);
};

const update = (req, res) => {
  const result = patientService.updatePatient(req.params.id, req.body);
  res.status(result.status).json(result.body);
};

const remove = (req, res) => {
  const result = patientService.deletePatient(req.params.id);
  res.status(result.status).json(result.body);
};

module.exports = { create, list, getById, update, remove };