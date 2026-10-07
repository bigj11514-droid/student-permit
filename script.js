const form = document.getElementById('checkin-form');
const studentList = document.getElementById('student-list');
const addButton = document.getElementById('add-student');
// Use the school's international WhatsApp number, digits only.
const WHATSAPP_PHONE_NUMBER = '233207918169';

function updateEntries() {
  const entries = [...studentList.querySelectorAll('.student-entry')];
  entries.forEach((entry, index) => {
    const number = String(index + 1).padStart(2, '0');
    entry.querySelector('.entry-number').textContent = number;
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

addButton.addEventListener('click', () => {
  const copy = studentList.querySelector('.student-entry').cloneNode(true);
  copy.querySelectorAll('input').forEach(input => { input.value = ''; });
  copy.querySelector('select').selectedIndex = 0;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'remove-button';
  remove.textContent = 'Remove';
  remove.addEventListener('click', () => { copy.remove(); updateEntries(); });
  copy.querySelector('legend').append(remove);
  studentList.append(copy);
  updateEntries();
  copy.querySelector('input').focus();
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
  const status = document.getElementById('form-message');
  status.textContent = '';

  if (!teacherName || !teacherPhone || students.some(student => !student.name || !student.classroom)) {
    status.textContent = 'Enter the teacher name and number, and complete every student name and class.';
    return;
  }
  if (teacherPhoneDigits.length < 8 || teacherPhoneDigits.length > 15) {
    status.textContent = 'Enter a valid teacher phone number, including the country code.';
    form.elements.teacherPhone.focus();
    return;
  }
  if (!/^\d{8,15}$/.test(WHATSAPP_PHONE_NUMBER)) {
    status.textContent = 'The school's WhatsApp recipient number is not configured correctly.';
    return;
  }

  const destination = document.querySelector('.destination-copy strong').textContent.trim();
  const studentLines = students.map((student, index) => `${index + 1}. ${student.name} - ${student.classroom}`);
  const message = `*${destination} Check-In*\n*Teacher:* ${teacherName}\n*Teacher WhatsApp:* ${teacherPhone}\n*Students:*\n${studentLines.join('\n')}`;
  const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  status.textContent = 'WhatsApp opened with the check-in ready. Review the recipient and message, then press Send in WhatsApp.';
});
