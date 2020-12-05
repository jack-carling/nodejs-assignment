const express = require('express');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('database.json');
const database = new lowdb(adapter);
const app = express();
const port = process.env.PORT || 8080;
const cart = require('./modules/cart');
const products = require('./modules/products');

app.use(express.static('server'));

app.database = database;

app.use('/api/cart', cart);
app.use('/api/products', products);

app.listen(port);