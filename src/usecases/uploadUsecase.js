const {
  uploadFile,
  generatePublicUrl,
} = require('../helpers/uploadGoogleDrive');

class UploadUsecase {
  constructor() {
    this.uploadFile = uploadFile;
    this.generatePublicUrl = generatePublicUrl;
  }

  async uploadFile(fileObject, type) {
    return this.uploadFile(fileObject, type);
  }

  async generatePublicUrl(fileId) {
    return this.generatePublicUrl(fileId);
  }
}

module.exports = UploadUsecase;
