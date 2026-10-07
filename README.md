# Dieudonne ICT Lab check-in

This is a static check-in form for GitHub Pages. Submitting opens WhatsApp with a prepared message; the teacher reviews and sends it in WhatsApp.

## Setup

1. Confirm the configured WhatsApp recipient in `script.js` is correct. It is set to `233207918169` (Ghana country code plus the provided local number without its leading zero).
2. Publish the files to GitHub Pages.
3. Enter the teacher's name and WhatsApp number, student names, and classes, then choose **Approve & send check-in**. WhatsApp opens with the message ready to review and send.

The school phone number is part of the public page source. Do not put access tokens or other secrets in the client-side files. The teacher's number is included in the message but does not change which WhatsApp account sends it. The school recipient must have an active WhatsApp account.
