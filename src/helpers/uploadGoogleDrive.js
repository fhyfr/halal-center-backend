/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();

const path = require('path');
const stream = require('stream');
const { google } = require('googleapis');
const logger = require('./logger');

const { DRIVE_FOLDER_ID } = process.env;
const KEYFILEPATH = path.join(__dirname, '../../credentials.json');
const SCOPES = ['https://www.googleapis.com/auth/drive'];

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: SCOPES,
});

const generatePublicUrl = async (fileId) => {
  try {
    await google.drive({ version: 'v3', auth }).permissions.create({
      fileId,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    const result = await google.drive({ version: 'v3', auth }).files.get({
      fileId,
      fields: 'webViewLink, webContentLink',
    });

    return result.data;
  } catch (error) {
    logger.error(error);
  }
};

const uploadFile = async (fileObject) => {
  const bufferStream = new stream.PassThrough();
  bufferStream.end(fileObject.buffer);
  const { data } = await google.drive({ version: 'v3', auth }).files.create({
    media: {
      mimeType: fileObject.mimeType,
      body: bufferStream,
    },
    requestBody: {
      name: fileObject.originalname,
      parents: [DRIVE_FOLDER_ID],
    },
    fields: 'id,name',
  });

  logger.info(`Uploaded file ${data.name} ${data.id}`);

  return {
    fileId: data.id,
    fileName: data.name,
  };
};

module.exports = { generatePublicUrl, uploadFile };
