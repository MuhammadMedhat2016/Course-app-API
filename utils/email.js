const nodemailer = require('nodemailer');
module.exports =  async ({ to, subject, text }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_EMAIL_PASSWORD.split('-').join(' '),
    },
  });

  const emailOptions = {
    from: 'Natours',
    to,
    subject,
    text,
  };
  
  return await transporter.sendMail(emailOptions);
};
