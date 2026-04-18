const nodemailer = require('nodemailer');

let transporter = null;

function getTransporter() {
  if (!transporter && process.env.MAIL_USER && process.env.MAIL_PASS && process.env.MAIL_PASS !== 'your_gmail_app_password_here') {
    transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
    });
  }
  return transporter;
}

async function sendMail(to, subject, html) {
  const t = getTransporter();
  if (!t) {
    console.log(`[Mailer] SMTP not configured — skipping email to ${to}: "${subject}"`);
    return;
  }
  try {
    await t.sendMail({
      from: `"AwadhMed" <${process.env.MAIL_USER}>`,
      to, subject, html
    });
    console.log(`[Mailer] Email sent to ${to}`);
  } catch (err) {
    console.warn(`[Mailer] Failed to send email to ${to}:`, err.message);
  }
}

exports.sendWelcomeEmail = async (user) => {
  await sendMail(user.email, 'Welcome to AwadhMed!', `
    <h2>Welcome, ${user.name}!</h2>
    <p>Thank you for registering with AwadhMed — Lucknow's Nawabi Healthcare Platform.</p>
    <p>You can now book appointments, order medicines, and explore government health schemes.</p>
    <br><p style="color:#888;font-size:12px;">AwadhMed · Hazratganj, Lucknow</p>
  `);
};

exports.sendBookingConfirmation = async (booking, doctor, patient) => {
  if (!patient || !patient.email) return;
  await sendMail(patient.email, `Booking Confirmed — ${booking.transactionRef}`, `
    <h2>Appointment Confirmed ✅</h2>
    <p>Dear ${patient.name},</p>
    <p>Your appointment has been confirmed:</p>
    <ul>
      <li><strong>Doctor:</strong> ${booking.doctorName}</li>
      <li><strong>Specialty:</strong> ${booking.doctorSpecialty}</li>
      <li><strong>Hospital:</strong> ${booking.hospital}</li>
      <li><strong>Date:</strong> ${booking.date}</li>
      <li><strong>Slot:</strong> ${booking.slot}</li>
      <li><strong>Ref:</strong> ${booking.transactionRef}</li>
    </ul>
    <br><p style="color:#888;font-size:12px;">AwadhMed · Hazratganj, Lucknow</p>
  `);
};

exports.sendBookingStatusUpdate = async (booking, doctor, patient, status) => {
  if (!patient || !patient.email) return;
  await sendMail(patient.email, `Appointment Update — ${booking.transactionRef}`, `
    <h2>Appointment Status Updated</h2>
    <p>Your appointment (Ref: ${booking.transactionRef}) has been updated to: <strong>${status.toUpperCase()}</strong>.</p>
    <br><p style="color:#888;font-size:12px;">AwadhMed · Hazratganj, Lucknow</p>
  `);
};

exports.sendOrderConfirmation = async (order, user) => {
  if (!user || !user.email) return;
  await sendMail(user.email, `Order Confirmed — ${order.transactionRef}`, `
    <h2>Order Confirmed ✅</h2>
    <p>Dear ${user.name}, your medicine order has been confirmed.</p>
    <p><strong>Ref:</strong> ${order.transactionRef} · <strong>Total:</strong> ₹${order.total}</p>
    <br><p style="color:#888;font-size:12px;">AwadhMed · Hazratganj, Lucknow</p>
  `);
};
