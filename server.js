const express = require('express');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('database.json');
const database = new lowdb(adapter);
const app = express();
const port = process.env.PORT || 8080;
const cart = require('./modules/cart');
const products = require('./modules/products');

// För att fetch ska fungera via VSCode live-server
app.use((request, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  next();
});

// För bilder på servern
app.use(express.static('server'));

// Moduler är uppdelade på förfrågningar som rör produkter/varukorgen
app.database = database;
app.use('/api/cart', cart);
app.use('/api/products', products);

app.listen(port);