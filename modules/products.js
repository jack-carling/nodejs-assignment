const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  const sortBy = request.query.sortby;
  const database = request.app.database;
  if (sortBy === 'price') {
    const data = database.get('products').sortBy('price').value();
    response.send(data);
  } else {
    const data = database.get('products').value();
    response.send(data);
  }
});

module.exports = router;