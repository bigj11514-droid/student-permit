const form = document.getElementById('checkin-form');
const studentList = document.getElementById('student-list');
const addButton = document.getElementById('add-student');

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

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const teacherName = form.elements.teacherName.value.trim();
  const students = [...studentList.querySelectorAll('.student-entry')].map(entry => ({
    name: entry.querySelector('[name="studentName"]').value.trim(),
    classroom: entry.querySelector('[name="studentClass"]').value
  }));
  const submitButton = form.querySelector('[type="submit"]');
  const buttonText = submitButton.querySelector('span');
  const originalText = buttonText.textContent;
  submitButton.disabled = true;
  buttonText.textContent = 'Sending check-in…';
  try {
    const response = await fetch('/api/checkin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teacherName, students })
    });
    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();
    let result = null;

    if (contentType.toLowerCase().includes('application/json')) {
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`The server returned invalid JSON (HTTP ${response.status}). Please try again later.`);
      }
    } else {
      const status = `${response.status}${response.statusText ? ` ${response.statusText}` : ''}`;
      throw new Error(`The server returned a web page instead of JSON (HTTP ${status}). Check that the app is running with its backend and that POST /api/checkin is available.`);
    }

    if (!response.ok) throw new Error(result.error || `The check-in could not be sent (HTTP ${response.status}).`);
    window.alert('WhatsApp accepted the check-in for sending to the school number.');
    form.reset();
    [...studentList.querySelectorAll('.student-entry')].slice(1).forEach(entry => entry.remove());
    updateEntries();
  } catch (error) {
    window.alert(`There was a problem sending the check-in to WhatsApp. ${error.message}`);
  } finally {
    submitButton.disabled = false;
    buttonText.textContent = originalText;
  }
});
