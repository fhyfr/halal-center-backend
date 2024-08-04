const getPagination = (page, size) => {
  let limit = size < 0 || size > 200 ? 200 : size;
  if (!limit) {
    limit = 20;
  }

  let offset = (page - 1) * limit;
  if (!offset) {
    offset = 0;
  }

  return { limit, offset };
};

const getPagingData = (dataRows, page, limit) => {
  const { count: itemCount, rows: data } = dataRows;
  const currentPage = page ? +page : 1;
  const pageCount = Math.ceil(itemCount / limit);

  return { itemCount, data, pageCount, currentPage };
};

module.exports = {
  getPagination,
  getPagingData,
};
