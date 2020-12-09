const express = require('express');
const lowdb = require('lowdb');
const cors = require('cors');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('database.json');
const database = new lowdb(adapter);
const app = express();
const port = process.env.PORT || 8080;
const cart = require('./modules/cart');
const products = require('./modules/products');

app.use(cors());

// För bilder på servern
app.use(express.static('server'));

// Moduler är uppdelade på förfrågningar som rör produkter/varukorgen
app.database = database;
app.use('/api/cart', cart);
app.use('/api/products', products);

app.listen(port);