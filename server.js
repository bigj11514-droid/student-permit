require('dotenv').config();

const express = require('express');
const path = require('path');

const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(express.json({ limit: '20kb' }));
app.use(express.static(__dirname));

app.post('/api/checkin', async (req, res) => {
  const { WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_TO, WHATSAPP_API_VERSION } = process.env;
  if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !WHATSAPP_TO || !WHATSAPP_API_VERSION) {
    return res.status(503).json({ error: 'WhatsApp Business API is not configured on the server.' });
  }
  if (!/^\d{8,15}$/.test(WHATSAPP_TO)) {
    return res.status(503).json({ error: 'The configured school WhatsApp recipient number is invalid.' });
  }

  const teacherName = req.body?.teacherName;
  const students = req.body?.students;
  if (typeof teacherName !== 'string' || !teacherName.trim() || teacherName.length > 100 ||
    !Array.isArray(students) || students.length < 1 || students.length > 30 || students.some(student =>
    typeof student?.name !== 'string' || !student.name.trim() || student.name.length > 100 ||
    typeof student?.classroom !== 'string' || !student.classroom.trim() || student.classroom.length > 50
  )) {
    return res.status(400).json({ error: 'Enter a valid name and class for every student.' });
  }

  const date = new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date());
  const roster = students.map((student, index) => `${index + 1}. ${student.name.trim()} - ${student.classroom.trim()}`).join('\n');
  const text = `ICT LAB STUDENT APPROVAL\nDieudonne International School\nApproving teacher: ${teacherName.trim()}\nDate: ${date}\n\nApproved students:\n${roster}`;

  try {
    const apiResponse = await fetch(`https://graph.facebook.com/${WHATSAPP_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: WHATSAPP_TO,
        type: 'text',
        text: { preview_url: false, body: text }
      })
    });
    const result = await apiResponse.json().catch(() => ({}));
    if (!apiResponse.ok) {
      console.error('WhatsApp API request failed:', JSON.stringify(result.error || result));
      return res.status(502).json({ error: result.error?.message || 'WhatsApp could not accept the message.' });
    }
    return res.json({ accepted: true, messageId: result.messages?.[0]?.id || null });
  } catch (error) {
    console.error('WhatsApp API connection failed:', error.message);
    return res.status(502).json({ error: 'Could not connect to WhatsApp. Check the server connection and try again.' });
  }
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => console.log(`ICT Lab check-in server listening on port ${port}`));
