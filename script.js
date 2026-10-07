const WHATSAPP_RECIPIENT = '233207918169'; // 0207918169 with Ghana's country code.

const form = document.getElementById('checkin-form');
const studentList = document.getElementById('student-list');
const addStudentButton = document.getElementById('add-student');
const statusMessage = document.getElementById('form-message');
const whatsappLink = document.getElementById('whatsapp-link');

function renumberStudents() {
  const entries = [...studentList.querySelectorAll('.student-entry')];

  entries.forEach((entry, index) => {
    const number = index + 1;
    const nameInput = entry.querySelector('[name="studentName"]');
    const classSelect = entry.querySelector('[name="studentClass"]');

    entry.querySelector('.entry-number').textContent = String(number).padStart(2, '0');
    nameInput.id = `student-name-${number}`;
    classSelect.id = `student-class-${number}`;
    entry.querySelector('label[for^="student-name-"]').htmlFor = nameInput.id;
    entry.querySelector('label[for^="student-class-"]').htmlFor = classSelect.id;

    const removeButton = entry.querySelector('.remove-button');
    if (removeButton) removeButton.hidden = entries.length === 1;
  });
}

addStudentButton.addEventListener('click', () => {
  const entry = studentList.querySelector('.student-entry').cloneNode(true);
  entry.querySelector('[name="studentName"]').value = '';
  entry.querySelector('[name="studentClass"]').selectedIndex = 0;

  const removeButton = document.createElement('button');
  removeButton.type = 'button';
  removeButton.className = 'remove-button';
  removeButton.textContent = 'Remove';
  removeButton.addEventListener('click', () => {
    entry.remove();
    renumberStudents();
  });

  entry.querySelector('legend').append(removeButton);
  studentList.append(entry);
  renumberStudents();
  entry.querySelector('[name="studentName"]').focus();
});

form.addEventListener('submit', event => {
  event.preventDefault();
  statusMessage.textContent = '';
  statusMessage.dataset.state = 'error';
  whatsappLink.hidden = true;

  if (!form.reportValidity()) return;

  const teacherName = form.elements.teacherName.value.trim();
  const teacherPhone = form.elements.teacherPhone.value.trim();
  const teacherPhoneDigits = teacherPhone.replace(/\D/g, '');
  const students = [...studentList.querySelectorAll('.student-entry')].map(entry => ({
    name: entry.querySelector('[name="studentName"]').value.trim(),
    classroom: entry.querySelector('[name="studentClass"]').value.trim()
  }));

  if (!teacherName || !teacherPhone || students.some(student => !student.name || !student.classroom)) {
    statusMessage.textContent = 'Complete the teacher details and every student name and class.';
    return;
  }

  if (teacherPhoneDigits.length < 8 || teacherPhoneDigits.length > 15) {
    statusMessage.textContent = 'Enter a valid teacher WhatsApp number, including its country code.';
    form.elements.teacherPhone.focus();
    return;
  }

  const studentsText = students
    .map((student, index) => `${index + 1}. ${student.name} - ${student.classroom}`)
    .join('\n');
  const message = [
    '*ICT LAB CHECK-IN*',
    '*Destination:* ICT Lab',
    `*Teacher:* ${teacherName}`,
    `*Teacher WhatsApp:* ${teacherPhone}`,
    '*Students:*',
    studentsText
  ].join('\n');

  const whatsappUrl = `https://wa.me/${WHATSAPP_RECIPIENT}?text=${encodeURIComponent(message)}`;
  whatsappLink.href = whatsappUrl;
  whatsappLink.hidden = false;
  statusMessage.dataset.state = 'info';
  statusMessage.textContent = 'Opening WhatsApp with the check-in ready. Review it and press Send.';

  // This runs directly from the submit click so browsers allow the new tab.
  const whatsappTab = window.open(whatsappUrl, '_blank');
  if (!whatsappTab) {
    statusMessage.dataset.state = 'error';
    statusMessage.textContent = 'Your browser blocked the WhatsApp tab. Select the Open WhatsApp message link below.';
  } else {
    whatsappTab.opener = null;
  }
});
