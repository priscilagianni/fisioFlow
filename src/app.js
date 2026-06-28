const express = require('express');
const cors = require('cors');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const db = require('./database/db');
 
const patientRoutes = require('./routes/patientRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
 
const app = express();
 
app.use(cors());
app.use(express.json());
 
// Serve static frontend files
app.use(express.static(path.join(__dirname, '../front-end/public')));
 
// Load and serve Swagger docs
try {
  const swaggerDocument = YAML.load(path.join(__dirname, '../docs/swagger.yaml'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
  console.warn('Swagger file not found, /api-docs disabled.');
}
 
// API routes
app.use('/patients', patientRoutes);
app.use('/appointments', appointmentRoutes);
 
// Test utility: reset in-memory database
app.delete('/test/reset', (req, res) => {
  db.patients = [];
  db.appointments = [];
  db.nextPatientId = 1;
  db.nextAppointmentId = 1;
  res.status(200).json({ message: 'Banco de dados resetado com sucesso.' });
});
 
// Fallback: serve frontend for non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../front-end/public/index.html'));
});
 
module.exports = app;
