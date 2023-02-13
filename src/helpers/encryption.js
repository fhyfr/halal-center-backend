const bcrypt = require('bcrypt');

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

const validatePassword = async (plainPassword, encryptedPassword) =>
  bcrypt.compare(plainPassword, encryptedPassword);

module.exports = {
  encryptPassword,
  validatePassword,
};
