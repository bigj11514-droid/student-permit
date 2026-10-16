# Dieudonne ICT Lab Check-In

A static GitHub Pages app for recording ICT lab visits and preparing WhatsApp messages. It does not use a server or send messages automatically. The teacher reviews the visit and the prefilled WhatsApp message before pressing **Send**.

## Publish

1. Publish `index.html`, `styles.css`, `script.js`, and `ict-lab-photo.jpg` with GitHub Pages.
2. Add recurring sessions under **Weekly lab schedule** if needed.
3. Enter the teacher, visit date/time and purpose, and each student's name and class.
4. Select **Review check-in**, check the preview, then choose **Save check-in & open WhatsApp**.
5. Review and send the prefilled message in WhatsApp. Record the students' check-out time in **Visit history** when they leave.
6. Search visit history or download a CSV report for school records.

The recipient is set in `script.js` as `233207918169`, the international format for the provided Ghanaian number `0207918169`. A teacher's device needs WhatsApp installed or WhatsApp Web signed in. If the browser blocks the new tab, use the **Open WhatsApp message** link shown by the form.

Visit history and the weekly schedule are stored only in the browser on the device being used. They are not backed up or shared with other devices, and this website has no login or access controls. Use only on a school-managed, non-shared device; download reports to an approved location and delete browser records when no longer needed. Do not treat this local storage as the school's authoritative attendance record.

The destination photo (`ict-lab-photo.jpg`) is from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Computer_Lab_Baraboo.jpg), by JackFromWisconsin, and is released under CC0.
