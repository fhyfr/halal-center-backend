const { NODE_ENV } = process.env;

const generateOTP = () => {
  if (NODE_ENV !== 'production') {
    return 123456;
  }
  return Math.floor(100000 + Math.random() * 900000);
};

module.exports = {
  generateOTP,
};
