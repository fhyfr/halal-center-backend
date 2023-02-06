const { Worker } = require('worker_threads');

function sendEmail(type, to, data) {
  let template = '';
  let subject = '';
  switch (type) {
    case 'forgotpassword':
      template = './src/email/templates/forgot-password.html';
      subject = 'Verifikasi Lupa Password';
      break;
    default:
      throw Error('template does not exist');
  }
  const worker = new Worker('./src/email/sender.js');
  const emailVar = {
    sender: 'Halal Center',
    to,
    subject,
    template,
    data: {
      s3url: process.env.S3_URL,
      ...data,
    },
  };
  worker.postMessage(emailVar);
}

module.exports = {
  sendEmail,
};
