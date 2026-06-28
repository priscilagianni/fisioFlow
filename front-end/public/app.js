const API = 'http://localhost:3000';



let allPatients = [];
let allAppointments = [];
let deleteCallback = null;



function showPage(page) {
  document.querySelectorAll('.page').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));

  document.getElementById(`page-${page}`).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');

  if (page === 'patients') loadPatients();
  if (page === 'appointments') {
    loadPatients(); // for dropdown
    loadAppointments();
  }
}

function showToast(msg, isError = false) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (isError ? ' error' : '');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    t.classList.remove('show');
  }, 3200);
}

function openModal(id) {
  document.getElementById(id).classList.add('open');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
}

function closeModalOnOverlay(event, id) {
  if (event.target === event.currentTarget) closeModal(id);
}

async function loadPatients() {
  try {
    const res = await fetch(`${API}/patients`);
    allPatients = await res.json();
    renderPatients(allPatients);
    updateBadge('patients', allPatients.length);
    document.getElementById('patients-count').textContent = allPatients.length;
    populatePatientDropdown();
  } catch {
    showToast('Erro ao carregar pacientes.', true);
  }
}

function renderPatients(patients) {
  const list = document.getElementById('patients-list');
  if (!patients || patients.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">👤</span>
        <p>Nenhum paciente cadastrado.</p>
        <button class="btn btn-primary" onclick="openPatientModal()">Cadastrar paciente</button>
      </div>`;
    return;
  }

  list.innerHTML = patients.map((p) => `
    <div class="item-row" data-id="${p.id}">
      <div class="item-avatar">${p.name.charAt(0).toUpperCase()}</div>
      <div class="item-info">
        <div class="item-name">${escHtml(p.name)}</div>
        <div class="item-meta">
          <span>🎂 ${p.age} anos</span>
          ${p.phone ? `<span>📞 ${escHtml(p.phone)}</span>` : ''}
          ${p.diagnosis ? `<span class="item-badge">${escHtml(p.diagnosis)}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon btn-edit" title="Editar paciente" onclick="openEditPatient(${p.id})">✏️ Editar</button>
        <button class="btn btn-icon btn-delete" title="Excluir paciente" onclick="askDeletePatient(${p.id}, '${escHtml(p.name)}')">🗑️ Excluir</button>
      </div>
    </div>
  `).join('');
}

function filterPatients(query) {
  const filtered = allPatients.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );
  renderPatients(filtered);
}

function populatePatientDropdown() {
  const sel = document.getElementById('appointment-patient');
  const current = sel.value;
  sel.innerHTML = '<option value="">Selecione um paciente...</option>';
  allPatients.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
  if (current) sel.value = current;
}

// Open modal for NEW patient
function openPatientModal() {
  document.getElementById('modal-patient-title').textContent = 'Novo Paciente';
  document.getElementById('patient-id').value = '';
  document.getElementById('patient-name').value = '';
  document.getElementById('patient-age').value = '';
  document.getElementById('patient-phone').value = '';
  document.getElementById('patient-diagnosis').value = '';
  document.getElementById('patient-error').style.display = 'none';
  openModal('modal-patient');
  setTimeout(() => document.getElementById('patient-name').focus(), 100);
}

async function openEditPatient(id) {
  const patient = allPatients.find((p) => p.id === id);
  if (!patient) return;

  document.getElementById('modal-patient-title').textContent = 'Editar Paciente';
  document.getElementById('patient-id').value = patient.id;
  document.getElementById('patient-name').value = patient.name;
  document.getElementById('patient-age').value = patient.age;
  document.getElementById('patient-phone').value = patient.phone || '';
  document.getElementById('patient-diagnosis').value = patient.diagnosis || '';
  document.getElementById('patient-error').style.display = 'none';
  openModal('modal-patient');
  setTimeout(() => document.getElementById('patient-name').focus(), 100);
}

async function savePatient() {
  const id = document.getElementById('patient-id').value;
  const data = {
    name: document.getElementById('patient-name').value.trim(),
    age: document.getElementById('patient-age').value,
    phone: document.getElementById('patient-phone').value.trim(),
    diagnosis: document.getElementById('patient-diagnosis').value.trim(),
  };

  const errorEl = document.getElementById('patient-error');

  try {
    let res;
    if (id) {
      res = await fetch(`${API}/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      res = await fetch(`${API}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    const result = await res.json();

    if (!res.ok) {
      errorEl.textContent = result.error || 'Erro ao salvar paciente.';
      errorEl.style.display = 'block';
      return;
    }

    closeModal('modal-patient');
    showToast(id ? '✅ Paciente atualizado!' : '✅ Paciente cadastrado!');
    loadPatients();
  } catch {
    errorEl.textContent = 'Erro de conexão com o servidor.';
    errorEl.style.display = 'block';
  }
}

function askDeletePatient(id, name) {
  document.getElementById('confirm-message').textContent = `Excluir paciente "${name}"? Esta ação não pode ser desfeita.`;
  deleteCallback = async () => {
    try {
      const res = await fetch(`${API}/patients/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Erro ao excluir.', true);
        return;
      }
      showToast('🗑️ Paciente removido.');
      loadPatients();
    } catch {
      showToast('Erro de conexão.', true);
    }
  };
  openModal('modal-confirm');
}

async function loadAppointments() {
  try {
    const res = await fetch(`${API}/appointments`);
    allAppointments = await res.json();
    renderAppointments(allAppointments);
    updateBadge('appointments', allAppointments.length);
    document.getElementById('appointments-count').textContent = allAppointments.length;
    updateTodayCount();
  } catch {
    showToast('Erro ao carregar agendamentos.', true);
  }
}

function updateTodayCount() {
  const today = new Date().toISOString().split('T')[0];
  const todayCount = allAppointments.filter((a) => a.date === today).length;
  document.getElementById('appointments-today').textContent = todayCount;
}

function renderAppointments(appointments) {
  const list = document.getElementById('appointments-list');
  if (!appointments || appointments.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon">📅</span>
        <p>Nenhum agendamento registrado.</p>
        <button class="btn btn-primary" onclick="openAppointmentModal()">Criar agendamento</button>
      </div>`;
    return;
  }

  const sorted = [...appointments].sort((a, b) => {
    const da = `${a.date}T${a.time}`;
    const db = `${b.date}T${b.time}`;
    return da.localeCompare(db);
  });

  list.innerHTML = sorted.map((a) => {
    const dateFormatted = formatDate(a.date);
    return `
    <div class="item-row" data-id="${a.id}">
      <div class="item-avatar appt-avatar">📅</div>
      <div class="item-info">
        <div class="item-name">${escHtml(a.patientName)}</div>
        <div class="item-meta">
          <span>📆 ${dateFormatted}</span>
          <span>🕐 ${a.time}</span>
          <span>⏱ ${a.durationMinutes} min</span>
          <span class="item-badge type-badge">${escHtml(a.type)}</span>
          ${a.notes ? `<span title="${escHtml(a.notes)}">📝 ${truncate(a.notes, 40)}</span>` : ''}
        </div>
      </div>
      <div class="item-actions">
        <button class="btn btn-icon btn-edit" onclick="openEditAppointment(${a.id})">✏️ Editar</button>
        <button class="btn btn-icon btn-delete" onclick="askDeleteAppointment(${a.id}, '${escHtml(a.patientName)}')">🗑️ Excluir</button>
      </div>
    </div>
  `}).join('');
}

async function filterByDay() {
  const date = document.getElementById('filter-date').value;
  if (!date) return;

  try {
    const res = await fetch(`${API}/appointments/day/${date}`);
    const result = await res.json();
    renderAppointments(result);
  } catch {
    showToast('Erro ao filtrar.', true);
  }
}

function clearFilter() {
  document.getElementById('filter-date').value = '';
  renderAppointments(allAppointments);
}

function openAppointmentModal() {
  document.getElementById('modal-appointment-title').textContent = 'Novo Agendamento';
  document.getElementById('appointment-id').value = '';
  document.getElementById('appointment-patient').value = '';
  document.getElementById('appointment-date').value = '';
  document.getElementById('appointment-time').value = '';
  document.getElementById('appointment-duration').value = '50';
  document.getElementById('appointment-type').value = '';
  document.getElementById('appointment-notes').value = '';
  document.getElementById('appointment-error').style.display = 'none';
  populatePatientDropdown();
  openModal('modal-appointment');
}

function openEditAppointment(id) {
  const appt = allAppointments.find((a) => a.id === id);
  if (!appt) return;

  document.getElementById('modal-appointment-title').textContent = 'Editar Agendamento';
  document.getElementById('appointment-id').value = appt.id;
  populatePatientDropdown();
  document.getElementById('appointment-patient').value = appt.patientId;
  document.getElementById('appointment-date').value = appt.date;
  document.getElementById('appointment-time').value = appt.time;
  document.getElementById('appointment-duration').value = appt.durationMinutes;
  document.getElementById('appointment-type').value = appt.type;
  document.getElementById('appointment-notes').value = appt.notes || '';
  document.getElementById('appointment-error').style.display = 'none';
  openModal('modal-appointment');
}

async function saveAppointment() {
  const id = document.getElementById('appointment-id').value;
  const data = {
    patientId: document.getElementById('appointment-patient').value,
    date: document.getElementById('appointment-date').value,
    time: document.getElementById('appointment-time').value,
    durationMinutes: document.getElementById('appointment-duration').value,
    type: document.getElementById('appointment-type').value,
    notes: document.getElementById('appointment-notes').value.trim(),
  };

  const errorEl = document.getElementById('appointment-error');

  try {
    let res;
    if (id) {
      res = await fetch(`${API}/appointments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      res = await fetch(`${API}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    }

    const result = await res.json();

    if (!res.ok) {
      errorEl.textContent = result.error || 'Erro ao salvar agendamento.';
      errorEl.style.display = 'block';
      return;
    }

    closeModal('modal-appointment');
    showToast(id ? '✅ Agendamento atualizado!' : '✅ Agendamento criado!');
    loadAppointments();
  } catch {
    errorEl.textContent = 'Erro de conexão com o servidor.';
    errorEl.style.display = 'block';
  }
}

function askDeleteAppointment(id, patientName) {
  document.getElementById('confirm-message').textContent = `Excluir agendamento de "${patientName}"? Esta ação não pode ser desfeita.`;
  deleteCallback = async () => {
    try {
      const res = await fetch(`${API}/appointments/${id}`, { method: 'DELETE' });
      const result = await res.json();
      if (!res.ok) {
        showToast(result.error || 'Erro ao excluir.', true);
        return;
      }
      showToast('🗑️ Agendamento removido.');
      loadAppointments();
    } catch {
      showToast('Erro de conexão.', true);
    }
  };
  openModal('modal-confirm');
}

function confirmDelete() {
  closeModal('modal-confirm');
  if (deleteCallback) {
    deleteCallback();
    deleteCallback = null;
  }
}

function updateBadge(section, count) {
  const badge = document.getElementById(`badge-${section}`);
  if (badge) badge.textContent = count;
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.substring(0, len) + '…' : str;
}

function applyPhoneMask(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    // (XX) XXXX-XXXX
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  } else {
    // (XX) XXXXX-XXXX
    return digits
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2');
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    ['modal-patient', 'modal-appointment', 'modal-confirm'].forEach(closeModal);
  }
});

window.addEventListener('DOMContentLoaded', () => {
  loadPatients();

  const phoneInput = document.getElementById('patient-phone');
  phoneInput.addEventListener('input', (e) => {
    const masked = applyPhoneMask(e.target.value);
    e.target.value = masked;
  });
});