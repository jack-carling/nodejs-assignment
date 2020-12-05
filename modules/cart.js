const express = require('express');
const router = express.Router();

router.get('/', (request, response) => {
  const data = request.app.database.get('cart').value();
  response.send(data);
});

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

router.put('/:change', (request, response) => {
  const change = request.params.change;
  const id = Number(request.query.id);
  if (!isNaN(id)) {
    const database = request.app.database;
    const data = updateCart(database, id, change);
    response.json(data);
  } else {
    response.json({success: false, message: 'Error: ID is not a number or missing'});
  }
});

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

function addToCart(database, id) {
  const product = database.get('products').find({id: id}).value();
  if (product !== undefined) {
      const productInCart = database.get('cart').find({id: id}).value();
    if (productInCart === undefined) {
      database.get('cart').push(product).write();
      return {success: true, message: 'Item added to cart'};
    } else {
      return {success: false, message: 'Error: Item already in cart'};
    }
  } else {
    return {success: false, message: 'Error: Item does not exist'};
  }
}

function updateCart(database, id, change) {
  const product = database.get('cart').find({id: id}).value();
  if (product !== undefined) {
    if (change === 'decrease' && product.count > 1) {
      const newCount = product.count - 1;
      database.get('cart').find({id: id}).assign({count: newCount}).write();
      return {success: true, message: 'Item count decreased'};
    } else if (change === 'increase' && product.count < 99) {
      const newCount = product.count + 1;
      database.get('cart').find({id: id}).assign({count: newCount}).write();
      return {success: true, message: 'Item count increased'};
    } else {
      if (change !== 'increase' && change !== 'decrease') {
        return {success: false, message: 'Error: Invalid parameter'};
      } else {
        return {success: false, message: 'Error: Item count cannot be less than 1 or more than 99'};
      }
    }
  } else {
    return {success: false, message: 'Error: Item is not in cart'};
  }
}

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