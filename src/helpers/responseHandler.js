const responseHandler = (req, res, next = null) => {
  if (res.json === undefined) {
    res.json = (data) => {
      res.end(JSON.stringify(data));
    };
  }

  res.respond = (data = null, status = 200) => {
    res.statusCode = status;
    res.json(data);
  };

  if (next !== null) next();
};

module.exports = {
  helper: () => responseHandler,
};
