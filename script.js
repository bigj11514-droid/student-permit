// Set this to the school's WhatsApp number in international format, digits only.
// Example: 250788123456 (do not include +, spaces, or dashes).
const WHATSAPP_NUMBER = 'YOUR_NUMBER_HERE';

const form = document.getElementById('checkin-form');
const studentList = document.getElementById('student-list');
const addButton = document.getElementById('add-student');
const message = document.getElementById('form-message');

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
  const first = studentList.querySelector('.student-entry');
  const copy = first.cloneNode(true);
  copy.querySelectorAll('input').forEach(input => { input.value = ''; });
  copy.querySelector('select').selectedIndex = 0;
  let remove = copy.querySelector('.remove-button');
  if (!remove) {
    remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'remove-button';
    remove.textContent = 'Remove';
    remove.addEventListener('click', () => { copy.remove(); updateEntries(); });
    copy.querySelector('legend').append(remove);
  }
  studentList.append(copy);
  updateEntries();
  copy.querySelector('input').focus();
  message.textContent = '';
});

form.addEventListener('submit', event => {
  event.preventDefault();
  message.textContent = '';
  if (!form.reportValidity()) return;
  if (!/^\d{8,15}$/.test(WHATSAPP_NUMBER)) {
    window.alert('There was a problem preparing the WhatsApp check-in. Please ask the site administrator to set the school WhatsApp number in script.js.');
    return;
  }

  const students = [...studentList.querySelectorAll('.student-entry')].map(entry => ({
    name: entry.querySelector('[name="studentName"]').value.trim(),
    classroom: entry.querySelector('[name="studentClass"]').value
  }));
  const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date());
  const lines = students.map((student, index) => `${index + 1}. ${student.name} — ${student.classroom}`);
  const text = `ICT LAB STUDENT CHECK-IN\nDieudonne International School\nDate: ${date}\n\n${lines.join('\n')}`;
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
  try {
    const whatsappWindow = window.open(whatsappUrl, '_blank');
    if (!whatsappWindow) {
      window.alert('Your browser blocked the WhatsApp window. Allow pop-ups for this site and try again.');
      return;
    }
    whatsappWindow.opener = null;
    window.alert('The check-in is ready in WhatsApp. Please review it and tap Send there to complete submission.');
  } catch (error) {
    window.alert('There was a problem opening WhatsApp. Please check your connection and try again.');
  }
});
