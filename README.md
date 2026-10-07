# Dieudonne ICT Lab check-in

This page sends the student roster from the server through the official WhatsApp Business Cloud API. It does not open WhatsApp on the teacher's device.

## Setup

1. Install Node.js 18 or later.
2. Create a Meta app and configure a WhatsApp Business Platform phone number and access token.
3. Copy `.env.example` to `.env` and enter the access token, the sending business phone number ID, and the destination WhatsApp number. Use the international country code and digits only for `WHATSAPP_TO`.
4. Install dependencies with `npm install`, then start the site with `npm start`.
5. Open `http://localhost:3000` in a browser. Keep `.env` private and never put the access token in `script.js` or other browser files.

The server reports success when Meta accepts the API request; that response does not confirm delivery or reading. A text message can be restricted by WhatsApp's customer service window. For messages outside that window, configure and send an approved WhatsApp message template instead of the free-form text currently used by `/api/checkin`.
