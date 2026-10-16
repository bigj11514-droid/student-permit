const form = document.getElementById('checkin-form');
const studentList = document.getElementById('student-list');
const addButton = document.getElementById('add-student');
const reviewPanel = document.getElementById('review-panel');
const preview = document.getElementById('message-preview');
const confirmCheckin = document.getElementById('confirm-checkin');
const editCheckin = document.getElementById('edit-checkin');
const historyList = document.getElementById('history-list');
const historySearch = document.getElementById('history-search');
const historyMessage = document.getElementById('history-message');
const scheduleList = document.getElementById('schedule-list');
const scheduleSelect = document.getElementById('scheduled-session');
const status = document.getElementById('form-message');
const whatsappLink = document.getElementById('whatsapp-link');
const WHATSAPP_PHONE_NUMBER = '233207918169';
const ATTENDANCE_KEY = 'dieudonne-ict-attendance-v1';
const SCHEDULE_KEY = 'dieudonne-ict-schedule-v1';
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

let attendance = [];
let schedule = [];
let storageReady = true;
let pendingCheckin = null;

function localDateTimeValue(date) {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 16);
}

function readStoredArray(key, label) {
  const value = localStorage.getItem(key);
  if (value === null) return [];
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new Error(`Saved ${label} data could not be read. Delete the damaged browser data before continuing.`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`Saved ${label} data has an invalid format. Delete the damaged browser data before continuing.`);
  }
  const isValid = label === 'visit history'
    ? parsed.every(record => record
      && typeof record.id === 'string'
      && typeof record.teacherName === 'string'
      && typeof record.teacherPhone === 'string'
      && typeof record.purpose === 'string'
      && typeof record.visitTime === 'string'
      && (record.checkOutTime === null || typeof record.checkOutTime === 'string')
      && Array.isArray(record.students)
      && record.students.every(student => student
        && typeof student.name === 'string'
        && typeof student.classroom === 'string'))
    : parsed.every(session => session
      && typeof session.id === 'string'
      && typeof session.name === 'string'
      && weekdays.includes(session.day)
      && typeof session.start === 'string'
      && typeof session.end === 'string');
  if (!isValid) {
    throw new Error(`Saved ${label} data has an invalid format. Delete the damaged browser data before continuing.`);
  }
  return parsed;
}

function saveStoredArray(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showMessage(element, message, isError = false) {
  element.textContent = message;
  element.dataset.state = isError ? 'error' : 'info';
}

function showStorageError(error) {
  storageReady = false;
  const notice = document.getElementById('storage-notice');
  notice.textContent = `Browser storage is unavailable: ${error.message} Visit history and schedules cannot be saved.`;
  notice.dataset.state = 'error';
  document.getElementById('download-report').disabled = true;
  document.getElementById('clear-history').disabled = true;
  document.getElementById('schedule-form').querySelector('button[type="submit"]').disabled = true;
}

function updateEntries() {
  const entries = [...studentList.querySelectorAll('.student-entry')];
  entries.forEach((entry, index) => {
    entry.querySelector('.entry-number').textContent = String(index + 1).padStart(2, '0');
    const name = entry.querySelector('[name="studentName"]');
    const classroom = entry.querySelector('[name="studentClass"]');
    name.id = `student-name-${index + 1}`;
    classroom.id = `student-class-${index + 1}`;
    entry.querySelector('label[for^="student-name-"]').htmlFor = name.id;
    entry.querySelector('label[for^="student-class-"]').htmlFor = classroom.id;
    const remove = entry.querySelector('.remove-button');
    if (remove) remove.hidden = entries.length === 1;
  });
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function buildCheckinMessage(data) {
  const destination = document.querySelector('.destination-copy strong').textContent.trim();
  const studentLines = data.students.map((student, index) => `${index + 1}. ${student.name} - ${student.classroom}`);
  const scheduleLine = data.scheduleName ? `\n*Scheduled session:* ${data.scheduleName}` : '';
  return `*${destination} Check-In*\n*Teacher:* ${data.teacherName}\n*Teacher WhatsApp:* ${data.teacherPhone}\n*Visit:* ${formatDate(data.visitTime)}\n*Purpose:* ${data.purpose}${scheduleLine}\n*Students:*\n${studentLines.join('\n')}`;
}

function makeWhatsAppUrl(message) {
  return `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
}

function updateScheduleOptions() {
  const chosenDate = document.getElementById('visit-time').value;
  const selectedDay = chosenDate ? weekdays[new Date(chosenDate).getDay()] : '';
  const selectedId = scheduleSelect.value;
  scheduleSelect.replaceChildren(new Option('Unscheduled lab visit', ''));
  schedule
    .filter(session => !selectedDay || session.day === selectedDay)
    .sort((a, b) => a.start.localeCompare(b.start))
    .forEach(session => {
      const option = new Option(`${session.day} ${session.start}-${session.end}: ${session.name}`, session.id);
      scheduleSelect.add(option);
    });
  if ([...scheduleSelect.options].some(option => option.value === selectedId)) {
    scheduleSelect.value = selectedId;
  }
}

function appendText(parent, tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) element.className = className;
  parent.append(element);
  return element;
}

function renderHistory() {
  const search = historySearch.value.trim().toLocaleLowerCase();
  const filtered = [...attendance]
    .sort((a, b) => new Date(b.visitTime) - new Date(a.visitTime))
    .filter(record => {
      const searchable = [
        record.teacherName,
        record.purpose,
        record.scheduleName,
        ...record.students.flatMap(student => [student.name, student.classroom])
      ].join(' ').toLocaleLowerCase();
      return searchable.includes(search);
    });

  historyList.replaceChildren();
  filtered.forEach(record => {
    const card = document.createElement('article');
    card.className = 'record-card';
    appendText(card, 'h4', `${record.students.map(student => student.name).join(', ')}`, 'record-title');
    appendText(card, 'p', `${record.students.map(student => student.classroom).join(', ')} · ${record.purpose}`);
    appendText(card, 'p', `Teacher: ${record.teacherName} · Check-in: ${formatDate(record.visitTime)}`);
    if (record.scheduleName) appendText(card, 'p', `Scheduled: ${record.scheduleName}`);
    if (record.checkOutTime) {
      appendText(card, 'p', `Checked out: ${formatDate(record.checkOutTime)}`, 'checkout-status');
    } else {
      const button = appendText(card, 'button', 'Record check-out now', 'secondary-button');
      button.type = 'button';
      button.dataset.checkoutId = record.id;
    }
    historyList.append(card);
  });
  document.getElementById('empty-history').hidden = attendance.length > 0;
  if (attendance.length > 0 && filtered.length === 0) {
    appendText(historyList, 'p', 'No visits match your search.', 'empty-state');
  }
}

function renderSchedule() {
  scheduleList.replaceChildren();
  [...schedule]
    .sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day) || a.start.localeCompare(b.start))
    .forEach(session => {
      const card = document.createElement('article');
      card.className = 'record-card schedule-card';
      appendText(card, 'h4', session.name, 'record-title');
      appendText(card, 'p', `${session.day} · ${session.start}–${session.end}`);
      const button = appendText(card, 'button', 'Remove session', 'text-button');
      button.type = 'button';
      button.dataset.scheduleId = session.id;
      scheduleList.append(card);
    });
  document.getElementById('empty-schedule').hidden = schedule.length > 0;
  updateScheduleOptions();
}

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadReport() {
  const rows = [['Teacher', 'Teacher WhatsApp', 'Visit purpose', 'Scheduled session', 'Student', 'Class', 'Check-in', 'Check-out']];
  attendance.forEach(record => {
    record.students.forEach(student => rows.push([
      record.teacherName,
      record.teacherPhone,
      record.purpose,
      record.scheduleName || '',
      student.name,
      student.classroom,
      formatDate(record.visitTime),
      record.checkOutTime ? formatDate(record.checkOutTime) : 'Not checked out'
    ]));
  });
  const csv = `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}`;
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `ict-lab-visits-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showMessage(historyMessage, 'Visit report downloaded.');
}

addButton.addEventListener('click', () => {
  const copy = studentList.querySelector('.student-entry').cloneNode(true);
  copy.querySelectorAll('input').forEach(input => { input.value = ''; });
  copy.querySelector('select').selectedIndex = 0;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-button';
  remove.textContent = 'Remove';
  copy.querySelector('legend').append(remove);
  studentList.append(copy);
  updateEntries();
  copy.querySelector('input').focus();
});

studentList.addEventListener('click', event => {
  const remove = event.target.closest('.remove-button');
  if (!remove) return;
  remove.closest('.student-entry').remove();
  updateEntries();
});

document.getElementById('visit-time').addEventListener('change', updateScheduleOptions);
historySearch.addEventListener('input', renderHistory);
document.getElementById('download-report').addEventListener('click', downloadReport);

document.getElementById('clear-history').addEventListener('click', () => {
  if (!attendance.length) {
    showMessage(historyMessage, 'There is no visit history to delete.');
    return;
  }
  if (!window.confirm('Delete all saved visit history from this browser? This cannot be undone.')) return;
  try {
    saveStoredArray(ATTENDANCE_KEY, []);
    attendance = [];
    renderHistory();
    showMessage(historyMessage, 'All visit history has been deleted from this browser.');
  } catch (error) {
    showMessage(historyMessage, `Could not delete visit history: ${error.message}`, true);
  }
});

form.addEventListener('submit', event => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const teacherName = form.elements.teacherName.value.trim();
  const teacherPhone = form.elements.teacherPhone.value.trim();
  const teacherPhoneDigits = teacherPhone.replace(/\D/g, '');
  const students = [...studentList.querySelectorAll('.student-entry')].map(entry => ({
    name: entry.querySelector('[name="studentName"]').value.trim(),
    classroom: entry.querySelector('[name="studentClass"]').value
  }));

  if (!teacherName || !teacherPhone || students.some(student => !student.name || !student.classroom)) {
    showMessage(status, 'Enter the teacher name and number, and complete every student name and class.', true);
    return;
  }
  if (teacherPhoneDigits.length < 8 || teacherPhoneDigits.length > 15) {
    showMessage(status, 'Enter a valid teacher phone number, including the country code.', true);
    form.elements.teacherPhone.focus();
    return;
  }
  if (!/^\d{8,15}$/.test(WHATSAPP_PHONE_NUMBER)) {
    showMessage(status, "The school's WhatsApp recipient number is not configured correctly.", true);
    return;
  }

  const visitTime = new Date(form.elements.visitTime.value);
  if (Number.isNaN(visitTime.getTime())) {
    showMessage(status, 'Enter a valid visit date and time.', true);
    form.elements.visitTime.focus();
    return;
  }

  const selectedSession = schedule.find(session => session.id === scheduleSelect.value);
  pendingCheckin = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    teacherName,
    teacherPhone,
    purpose: form.elements.visitPurpose.value,
    scheduleName: selectedSession ? `${selectedSession.day} ${selectedSession.start}-${selectedSession.end}: ${selectedSession.name}` : '',
    visitTime: visitTime.toISOString(),
    checkOutTime: null,
    students
  };
  preview.textContent = buildCheckinMessage(pendingCheckin);
  whatsappLink.hidden = true;
  reviewPanel.hidden = false;
  showMessage(status, 'Review the prepared check-in message below.');
  confirmCheckin.focus();
});

editCheckin.addEventListener('click', () => {
  reviewPanel.hidden = true;
  form.elements.teacherName.focus();
});

confirmCheckin.addEventListener('click', () => {
  if (!pendingCheckin) {
    showMessage(status, 'Review the visit details before continuing.', true);
    return;
  }
  if (!/^\d{8,15}$/.test(WHATSAPP_PHONE_NUMBER)) {
    showMessage(status, "The school's WhatsApp recipient number is not configured correctly.", true);
    return;
  }
  const message = buildCheckinMessage(pendingCheckin);
  const url = makeWhatsAppUrl(message);
  if (!storageReady) {
    whatsappLink.href = url;
    whatsappLink.hidden = false;
    reviewPanel.hidden = true;
    showMessage(status, 'Browser storage is unavailable, so this visit was not saved. WhatsApp should open; use the link below if it does not.', true);
    window.open(url, '_blank', 'noopener,noreferrer');
    pendingCheckin = null;
    return;
  }
  try {
    const updatedAttendance = [...attendance, pendingCheckin];
    saveStoredArray(ATTENDANCE_KEY, updatedAttendance);
    attendance = updatedAttendance;
    renderHistory();
    whatsappLink.href = url;
    whatsappLink.hidden = false;
    reviewPanel.hidden = true;
    showMessage(status, 'Check-in saved on this device. WhatsApp should open; if it does not, use the link below.');
    window.open(url, '_blank', 'noopener,noreferrer');
    pendingCheckin = null;
  } catch (error) {
    showStorageError(error);
    whatsappLink.href = url;
    whatsappLink.hidden = false;
    reviewPanel.hidden = true;
    showMessage(status, `This visit was not saved: ${error.message} WhatsApp should open; use the link below if it does not.`, true);
    window.open(url, '_blank', 'noopener,noreferrer');
    pendingCheckin = null;
  }
});

historyList.addEventListener('click', event => {
  const button = event.target.closest('[data-checkout-id]');
  if (!button) return;
  const record = attendance.find(item => item.id === button.dataset.checkoutId);
  if (!record || record.checkOutTime) return;
  const updatedAttendance = attendance.map(item => item.id === record.id
    ? { ...item, checkOutTime: new Date().toISOString() }
    : item);
  try {
    saveStoredArray(ATTENDANCE_KEY, updatedAttendance);
    attendance = updatedAttendance;
    renderHistory();
    showMessage(historyMessage, 'Check-out time recorded.');
  } catch (error) {
    showMessage(historyMessage, `Could not record check-out: ${error.message}`, true);
  }
});

document.getElementById('schedule-form').addEventListener('submit', event => {
  event.preventDefault();
  const scheduleForm = event.currentTarget;
  if (!scheduleForm.reportValidity()) return;
  const start = scheduleForm.elements.scheduleStart.value;
  const end = scheduleForm.elements.scheduleEnd.value;
  if (start >= end) {
    showMessage(document.getElementById('schedule-message'), 'The end time must be later than the start time.', true);
    scheduleForm.elements.scheduleEnd.focus();
    return;
  }
  const session = {
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`,
    name: scheduleForm.elements.scheduleClass.value.trim(),
    day: scheduleForm.elements.scheduleDay.value,
    start,
    end
  };
  try {
    const updatedSchedule = [...schedule, session];
    saveStoredArray(SCHEDULE_KEY, updatedSchedule);
    schedule = updatedSchedule;
    renderSchedule();
    scheduleForm.reset();
    showMessage(document.getElementById('schedule-message'), 'Weekly lab session added.');
  } catch (error) {
    showMessage(document.getElementById('schedule-message'), `Could not save the weekly session: ${error.message}`, true);
  }
});

scheduleList.addEventListener('click', event => {
  const button = event.target.closest('[data-schedule-id]');
  if (!button) return;
  const updatedSchedule = schedule.filter(session => session.id !== button.dataset.scheduleId);
  try {
    saveStoredArray(SCHEDULE_KEY, updatedSchedule);
    schedule = updatedSchedule;
    renderSchedule();
    showMessage(document.getElementById('schedule-message'), 'Weekly session removed.');
  } catch (error) {
    showMessage(document.getElementById('schedule-message'), `Could not remove the weekly session: ${error.message}`, true);
  }
});

document.getElementById('visit-time').value = localDateTimeValue(new Date());
try {
  attendance = readStoredArray(ATTENDANCE_KEY, 'visit history');
} catch (error) {
  showStorageError(error);
}
try {
  schedule = readStoredArray(SCHEDULE_KEY, 'weekly schedule');
} catch (error) {
  showStorageError(error);
}
renderHistory();
renderSchedule();
