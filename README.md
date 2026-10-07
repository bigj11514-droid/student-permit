# Dieudonne ICT Lab check-in

This is a static check-in form for GitHub Pages. Submitting opens WhatsApp with a prepared message; the teacher reviews and sends it in WhatsApp.

## Setup

1. In `script.js`, replace `YOUR_PHONE_NUMBER` in `WHATSAPP_PHONE_NUMBER` with the school's WhatsApp number in international format, using digits only (country code included, with no `+`, spaces, or punctuation).
2. Publish the files to GitHub Pages.
3. Enter the approving teacher's name and student names, then choose **Approve & send check-in**. WhatsApp opens with the message ready to review and send.

The phone number is part of the public page source. Do not put access tokens or other secrets in the client-side files. The WhatsApp recipient must have an active WhatsApp account.
