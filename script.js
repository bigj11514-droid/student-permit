const form = document.getElementById('checkin-form');
const studentList = document.getElementById('student-list');
const addButton = document.getElementById('add-student');
// Use the school's international WhatsApp number, digits only.
const WHATSAPP_PHONE_NUMBER = 'YOUR_PHONE_NUMBER';

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
  const students = [...studentList.querySelectorAll('.student-entry')]
    .map(entry => entry.querySelector('[name="studentName"]').value.trim());
  const status = document.getElementById('form-message');
  status.textContent = '';

  if (!teacherName || students.some(name => !name)) {
    status.textContent = 'Enter the approving teacher’s name and every student’s name.';
    return;
  }
  if (!/^\d{8,15}$/.test(WHATSAPP_PHONE_NUMBER)) {
    status.textContent = 'Set WHATSAPP_PHONE_NUMBER in script.js to the school’s WhatsApp number in international format (digits only).';
    return;
  }

  const destination = document.querySelector('.destination-copy strong').textContent.trim();
  const message = `*${destination} Check-In*\n*Teacher:* ${teacherName}\n*Students:*\n${students.map(name => `• ${name}`).join('\n')}`;
  const url = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
  const whatsappWindow = window.open(url, '_blank', 'noopener,noreferrer');

  if (whatsappWindow) {
    status.textContent = 'WhatsApp opened with the check-in ready to send. Review it and press Send.';
  } else {
    status.textContent = 'Your browser blocked the WhatsApp window. Allow pop-ups for this site and try again.';
  }
});