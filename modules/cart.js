const express = require('express');
const router = express.Router();

// Hämta alla produkter i varukorgen
router.get('/', (request, response) => {
  const data = request.app.database.get('cart').value();
  response.send(data);
});

// Lägga till en produkt i varukorgen, kollar om ID:et är giltigt först
router.post('/', (request, response) => {
  const id = Number(request.query.id);
  if (!isNaN(id)) {
    const database = request.app.database;
    const data = addToCart(database, id);
    response.json(data);
  } else {
    response.json({success: false, message: 'Error: ID is not a number or missing'});
  }
});

// För att ändra antalet av en produkt i varukorgen, kollar om ID:et är giltigt först
router.put('/', (request, response) => {
  const id = Number(request.query.id);
  const count = Number(request.query.count);
  if (!isNaN(id)&&!isNaN(count)) {
    const database = request.app.database;
    const data = updateCart(database, id, count);
    response.json(data);
  } else {
    response.json({success: false, message: 'Error: ID and/or count is not a number or missing'});
  }
});

// För att ta bort en produkt från varukorgen, kollar om ID:et är giltigt först
router.delete('/', (request, response) => {
  const id = Number(request.query.id);
  if (!isNaN(id)) {
    const database = request.app.database;
    const data = removeFromCart(database, id);
    response.json(data);
  } else {
    response.json({success: false, message: 'Error: ID is not a number or missing'});
  }
});

/*
Funktion för att lägga till produkt i varukorg från databas
Kollar först om produkten existerar i databasen
Kontrollerar sedan att användaren inte redan har produkten i varukorgen
*/
function addToCart(database, id) {
  const product = database.get('products').find({id: id}).value();
  if (product !== undefined) {
      const productInCart = database.get('cart').find({id: id}).value();
    if (productInCart === undefined) {
      database.get('cart').push({
                                  id: product.id,
                                  name: product.name,
                                  price: product.price,
                                  img: product.img,
                                  count: 1
                                }).write();
      return {success: true, message: 'Item added to cart'};
    } else {
      return {success: false, message: 'Error: Item already in cart'};
    }
  } else {
    return {success: false, message: 'Error: Item does not exist'};
  }
}

/*
Funktion för att uppdatera antalet av en produkt i varukorgen
Kontrollerar först om produkten ligger i varukorgen
Modifierar count om antalet är mellan 1-99
Går alltså inte att ha färre än 1 produkt eller fler än 99 i varukorgen
Måste vara ett tal utan decimaler
*/
function updateCart(database, id, count) {
  const product = database.get('cart').find({id: id}).value();
  if (product !== undefined) {
    if (Number.isInteger(count)) {
      if (count >= 1 && count <= 99) {
        database.get('cart').find({id: id}).assign({count: count}).write();
        return {success: true, message: 'Item count altered'};
      } else {
        return {success: false, message: 'Error: Count can only be between 1-99'};
      }
    } else {
      return {success: false, message: 'Error: Count is not an integer'};
    }
  } else {
    return {success: false, message: 'Error: Item is not in cart'};
  }
}

/*
Funktion för att ta bort från varukorgen
Kontrollerar först om produkten ligger i varukorgen
Tar därefter bort produkten
*/
function removeFromCart(database, id) {
  const item = database.get('cart').find({id: id}).value();
  if (item !== undefined) {
    database.get('cart').remove({id: id}).write();
    return {success: true, message: 'Item has been removed from cart'};
  } else {
    return {success: false, message: 'Error: Item is not in cart'};
  }
}

module.exports = router;