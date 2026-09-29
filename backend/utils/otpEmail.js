const nodemailer = require("nodemailer");
const crypto = require("crypto");

// Gmail SMTP (use an App Password, NOT your normal Gmail password)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Secure random 6-digit code
const generateOtp = () => String(crypto.randomInt(100000, 1000000));

// Store only a hash of the OTP in the database, never the plain code
const hashOtp = (otp) =>
  crypto
    .createHash("sha256")
    .update(otp + process.env.JWT_SECRET)
    .digest("hex");

const sendOtpEmail = async (to, name, otp) => {
  await transporter.sendMail({
    from: `"MindCare" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your MindCare verification code",
    text: `Hi ${name}, your verification code is ${otp}. It expires in 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto">
        <h2>Verify your email</h2>
        <p>Hi ${name}, use this code to finish creating your account:</p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px">${otp}</p>
        <p>This code expires in 10 minutes. If you didn't request it, ignore this email.</p>
      </div>
    `,
  });
};

module.exports = { generateOtp, hashOtp, sendOtpEmail };