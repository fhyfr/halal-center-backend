require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const handlebars = require('handlebars');
const { parentPort } = require('worker_threads');
const logger = require('../helpers/logger');

const transporter = nodemailer.createTransport({
  service: process.env.MAIL_SERVICE,
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    type: 'login',
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASSWORD,
  },
});

const readHTMLFile = (path, callback) => {
  fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
    if (err) {
      callback(err);
      throw err;
    } else {
      callback(null, html);
    }
  });
};

// eslint-disable-next-line no-unused-vars
function sendMail(data) {
  /*
    [sender,to,subject]
    are not valid template variable
    */
  readHTMLFile(data.template, (err, html) => {
    const template = handlebars.compile(html);
    const htmlToSend = template(data);
    const mailOptions = {
      sender: process.env.MAIL_SENDER,
      from: process.env.MAIL_FROM,
      to: data.to,
      subject: data.subject,
      html: htmlToSend,
    };
    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        logger.error(error);
        logger.error('Mail failed!!');
      } else logger.info(`Mail sent to ${mailOptions.to}`);
    });
  });
}

parentPort.on('message', (data) => {
  parentPort.postMessage(sendMail(data));
});
