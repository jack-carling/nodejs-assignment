const express = require('express');
const router = express.Router();

/*
Hämtar alla produkter i databasen
Om sortby=price är inkluderat så kommer den hämta alla efter pris
*/
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