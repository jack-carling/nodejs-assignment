const productsWrapper = document.querySelector('.products');
const cartCount = document.querySelector('#cart-count');

const cartButton = document.querySelector('.cart');
const cartList = document.querySelector('#list');
const cartTotal = document.querySelector('#total');
const cartClose = document.querySelector('#close-cart');
const overlayCart = document.querySelector('.overlay--cart');

const overlayBanner = document.querySelector('.overlay--banner');
const overlayBannerText = document.querySelector('#overlay--banner-text');
const overlayBannerCount = document.querySelector('#overlay--banner-count');
const overlayBannerClose = document.querySelector('#close-banner');
const overlayBannerRemove = document.querySelector('.remove');
const overlayWrapper = document.querySelector('.overlay--wrapper');
const overlayWrapperText = document.querySelector('#overlay--wrapper-text');

const searchInput = document.querySelector('#search-input');
const searchButton = document.querySelector('#search-button');

const searchResult = document.querySelector('#search-result');
const searchText = document.querySelector('#search-info');
const sortByName = document.querySelector('#sortbyname');
const sortByPrice = document.querySelector('#sortbyprice');

const baseUrl = 'http://localhost:8080';

let data = [];          // Data from API (products) will be saved here
let cart = [];          // Data from API (cart) will be saved here
let search = [];        // Data generated by user search will be saved here
let searching = false;  // User is searching true/false
let sortBy = '';        // Query when fetching data | blank = default or sort by 'price'

/*
Function to fetch products in database from API
API sorts by name or price depending on query
Runs functions to display all products and check what is already in cart
*/
async function getData() {
  let query;
  if (sortBy === 'price') {
    query = '?sortby=price';
  } else {
    query = '';
  }
  const endpoint = '/api/products';
  const response = await fetch(baseUrl + endpoint + query);
  data = await response.json();
  await getCart();
  displayProducts();
}

getData();

// Fetch cart from API and display number of products in cart
async function getCart() {
  const endpoint = '/api/cart';
  const response = await fetch(baseUrl + endpoint);
  cart = await response.json();
  cartCount.innerHTML = cart.length;
}

/*
Function to display all products
Check if user is searching to display all or just result from search
Created div-element with the following children:
  • img - for products image
  • span - with price of product
  • span - with name of product
  • button - for adding to cart
  • check - hidden by default but visible if item is in cart
Button and check is placed inside article-container for positioning in CSS
*/
function displayProducts() {
  let products = [];
  productsWrapper.innerHTML = '';
  if (searching === true) {
    products = search;
  } else {
    products = data;
  }
  for (let i = 0; i < products.length; i++) {
    const imgUrl = baseUrl + products[i].img;
    let node = document.createElement('div');
    let imgNode = document.createElement('img');
    imgNode.setAttribute('src', imgUrl);
    let priceNode = document.createElement('span');
    priceNode.innerHTML = '$' + products[i].price;
    let textNode = document.createElement('span');
    textNode.innerHTML = products[i].name;
      let buttonContainerNode = document.createElement('article');
      buttonContainerNode.setAttribute('class', 'shopping-button');
      let buttonNode = document.createElement('i');
      buttonNode.setAttribute('class', 'material-icons');
      buttonNode.setAttribute('shop-id', products[i].id);
      buttonNode.innerHTML = 'shopping_cart';
      buttonNode.addEventListener('click', (e) => addToCart(e));
      let checkNode = document.createElement('i');
      checkNode.setAttribute('class', 'material-icons check hide');
      checkNode.setAttribute('check-id', products[i].id);
      checkNode.innerHTML = 'check_circle';
    node.appendChild(imgNode);
    node.appendChild(priceNode);
    node.appendChild(textNode);
    buttonContainerNode.appendChild(buttonNode);
    buttonContainerNode.appendChild(checkNode);
    node.appendChild(buttonContainerNode);
    productsWrapper.append(node);
  }
  checkProductsInCart();
}

// Adding product to cart
async function addData(id) {
  const endpoint = `/api/cart?id=${id}`;
  const response = await fetch(baseUrl + endpoint, {method: 'POST'});
  const answer = await response.json();
  await getCart();
  return answer;
}

// Removing product from cart
async function removeData(id) {
  const endpoint = `/api/cart?id=${id}`;
  const response = await fetch(baseUrl + endpoint, {method: 'DELETE'});
  const answer = await response.json();
  await getCart();
  return answer;
}

// Changing the count of product in cart
async function changeAmount(id, amount) {
  const endpoint = `/api/cart?id=${id}&count=${amount}`;
  const response = await fetch(baseUrl + endpoint, {method: 'PUT'});
  const answer = await response.json();
  return answer;
}

/*
When clicking button generated while displaying products this function is run prior to fetch
Which product to add is determined by the attribute shop-id the button has
Attribute shop-id corresponds with id of product in database
If product is successfully added to cart:
  • Wrapper shows with message that product was added to cart
  • Green check is displayed next to button
If product is already in cart:
  • Wrapper shows with message that product is already in cart
  • Banner is displayed, prompting to change count
  • If count is less than 99 it asks if user wants to buy more than current count
  • Otherwise message tells user that product is at max count
*/
async function addToCart(e) {
  const id = Number(e.target.getAttribute('shop-id'));
  const answer = await addData(id);
  const product = findProductInCart(id);
  if (answer.success === true) {
    overlayWrapperText.innerHTML = `${product.name} added to cart!`;
    overlayWrapperAnimation();
    const check = document.querySelector(`i[check-id='${id}']`);
    check.classList.remove('hide');
  } else {
    overlayWrapperText.innerHTML = `${product.name} already in cart!`;
    overlayWrapperAnimation();
    overlayBanner.classList.remove('hide');
    overlayBannerCount.classList.remove('wiggle');
    overlayBannerRemove.setAttribute('shop-id', product.id);
    overlayBannerCount.setAttribute('shop-id', product.id);
    const count = (product.count === 99)  ? "Great! You're stocked up to the max!"
                                          : `Would you like to buy more than ${product.count}?`;
    overlayBannerText.innerHTML = `<h1>${product.name}</h1>` +
                                  `<br>This product is already in your cart.<br>` + count;
    overlayBannerCount.value = product.count;
  }
}

// Finds product in cart by id
function findProductInCart(number) {
  return cart.find(({id}) => id === number);
}

// Finds position of product in cart array by id
function findProductIndex(number) {
  return cart.findIndex(({id}) => id === number);
}

// Animation for wrapper to fade out
function overlayWrapperAnimation() {
  overlayWrapper.classList.remove('fade');
  void overlayWrapper.offsetWidth; // Required to restart a CSS animation
  overlayWrapper.classList.add('fade');
}

// Checks if product is in cart and displays the green check
function checkProductsInCart() {
  for (let i = 0; i < cart.length; i++) {
    const check = document.querySelector(`i[check-id='${cart[i].id}']`);
    if (check !== null) { // Check if the product isn't hidden from search
    check.classList.remove('hide');
    }
  }
}

// Hides the banner and removes the wiggle animation from count so it's not triggered if banner is opened again
overlayBannerClose.addEventListener('click', () => {
  overlayBanner.classList.add('hide');
  overlayBannerCount.classList.remove('wiggle');
});

/*
Function for changing count for product when banner is displayed
Will update database if count is valid
Only integers between 1-99, otherwise an error message is displayed
*/
overlayBannerCount.addEventListener('change', async (e) => {
  const id = Number(e.target.getAttribute('shop-id'));
  let amount = Number(e.target.value);
  const product = findProductInCart(id);
  if (amount < 1) {
    amount = 1;
    e.target.value = 1;
    wiggleAnimation(overlayBannerCount);
    overlayBannerText.innerHTML = `<h1>${product.name}</h1>` +
                                  `<br>This product is already in your cart.<br>` +
                                  `You cannot have less than 1 in your cart, click remove from cart instead to delete.`;
  } else if (amount > 99) {
    amount = 99;
    e.target.value = 99;
    wiggleAnimation(overlayBannerCount);
    overlayBannerText.innerHTML = `<h1>${product.name}</h1>` +
                                  `<br>This product is already in your cart.<br>` +
                                  `Unfortunately there is a limit to 99 per customer.`;
  } else if (!Number.isInteger(amount)) {
    e.target.value = Math.floor(e.target.value);
    amount = e.target.value;
    wiggleAnimation(overlayBannerCount);
    overlayBannerText.innerHTML = `<h1>${product.name}</h1>` +
                                  `<br>This product is already in your cart.<br>` +
                                  `You cannot buy half of something!`;
  } else {
    overlayBannerText.innerHTML = `<h1>${product.name}</h1>` +
                                  `<br>This product is already in your cart.<br>` +
                                  `Amount changed!`;
  }
  changeAmount(id, amount);
});

/*
Function to remove item from cart when banner is displayed
Will remove from database and display wrapper with message
Hides green check next to product and closes the banner
*/
overlayBannerRemove.addEventListener('click', async (e) => {
  const id = Number(e.target.getAttribute('shop-id'));
  const product = findProductInCart(id);
  const answer = await removeData(id);
  if (answer.success === true) {
    await getCart();
    const check = document.querySelector(`i[check-id='${id}']`);
    check.classList.add('hide');
    overlayWrapperText.innerHTML = `${product.name} removed from cart!`;
    overlayWrapperAnimation();
    overlayBanner.classList.add('hide');
  }
})

// To display the cart overlay
cartButton.addEventListener('click', () => {
  overlayCart.classList.remove('hide');
  displayCart();
});

// Hides the cart overlay
cartClose.addEventListener('click', () => {
  overlayCart.classList.add('hide');
});

/*
Function first updates the cart array
Removes the hide class to display overlay
If cart is not empty it generates similar elements as when displaying products in a ul-list
  • img - for products image
  • span - with name of product
  • span - with price of product
  • span - with total price of product (counted)
  • input - field to change count of product
  • button - for removing from cart
Also generates headers for the ul-list and message for user if cart is empty
Grand total is all products added together with their price times their count
*/
async function displayCart() {
  await getCart();
  overlayBanner.classList.add('hide');
  cartList.innerHTML = '';
  if (cart.length > 0) {
    let total = 0;
    let headerNode = document.createElement('li');
    headerNode.innerHTML =  '<span>Image</span>' +
                            '<span>Product</span>' +
                            '<span>Price</span>' +
                            '<span>Amount</span>' +
                            '<span>Total</span>';
    cartList.append(headerNode);
    for (let i = 0; i < cart.length; i++) {
      let node = document.createElement('li');
      let imageNode = document.createElement('img');
      const imgUrl = baseUrl + cart[i].img;
      imageNode.setAttribute('src', imgUrl);
      let nameNode = document.createElement('span');
      nameNode.innerHTML = cart[i].name;
      let priceNode = document.createElement('span');
      priceNode.innerHTML = '$' + cart[i].price;
      let inputNode = document.createElement('input');
      inputNode.setAttribute('type', 'number');
      inputNode.setAttribute('min', 1);
      inputNode.setAttribute('max', 99);
      inputNode.setAttribute('shop-id', cart[i].id);
      inputNode.value = cart[i].count;
      inputNode.addEventListener('change', (e) => updateCartCount(e.target));
      let totalNode = document.createElement('span');
      totalNode.setAttribute('shop-id', cart[i].id);
      totalNode.innerHTML = '$' + (cart[i].price * cart[i].count);
      let removeNode = document.createElement('i');
      removeNode.setAttribute('class', 'material-icons');
      removeNode.setAttribute('shop-id', cart[i].id);
      removeNode.innerHTML = 'remove_circle';
      removeNode.addEventListener('click', (e) => removeFromCart(e));
      node.appendChild(imageNode);
      node.appendChild(nameNode);
      node.appendChild(priceNode);
      node.appendChild(inputNode);
      node.appendChild(totalNode);
      node.appendChild(removeNode);
      cartList.append(node);
      total += cart[i].price * cart[i].count;
    }
    cartTotal.innerHTML = 'Grand Total: $' + total;
  } else {
    let headerNode = document.createElement('li');
    headerNode.innerHTML =  '<span>Cart is empty</span>';
    cartList.append(headerNode);
    cartTotal.innerHTML = 'Grand Total: $0';
  }
}

/*
When value of count is changed for product inside the cart overlay
New count is entered into database if valid
Same error handling as in the banner, but no error messages
Only integers between 1-99, wiggle function is called to display incorrect value
Total is updated as well as the grand total
*/
async function updateCartCount(product) {
  const id = Number(product.getAttribute('shop-id'));
  let amount = Number(product.value);
  const totalForProduct = document.querySelector(`span[shop-id='${id}']`);
  const index = findProductIndex(id);
  if (amount < 1) {
    amount = 1;
    product.value = 1;
    wiggleAnimation(product);
  } else if (amount > 99) {
    amount = 99;
    product.value = 99;
    wiggleAnimation(product);
  } else if (!Number.isInteger(amount)) {
    amount = Math.floor(amount);
    product.value = amount;
    wiggleAnimation(product);
  }
  cart[index].count = amount;
  totalForProduct.innerHTML = '$' + (cart[index].price * cart[index].count);
  changeAmount(id, amount);
  let total = 0;
  for (let i = 0; i < cart.length; i++) {
    total += cart[i].price * cart[i].count;
  }
  cartTotal.innerHTML = 'Grand Total: $' + total;
}

// To remove an item from the cart overlay
async function removeFromCart(e) {
  const id = Number(e.target.getAttribute('shop-id'));
  const answer = await removeData(id);
  if (answer.success === true) {
    displayCart();
    const check = document.querySelector(`i[check-id='${id}']`);
    check.classList.add('hide');
  }
}

// Animation to be run on the element that is called as a parameter
function wiggleAnimation(obj) {
  obj.classList.remove('wiggle');
  void obj.offsetWidth; // Required to restart a CSS animation
  obj.classList.add('wiggle');
}

// Search can be triggered by clicking the search icon or pressing the enter-key
searchButton.addEventListener('click', searchProducts);
searchInput.addEventListener('keyup', (e) => {
 if (e.key === 'Enter') {
   searchProducts();
 }
});

/*
Search function is only run if input contains more than 1 letter
Converts search word to a case-insensitive regular expression
Pushing all matching products into the search array
Alters text to display search word, result and a clearing function
If search word is longer than 10 letters the remaining will be displayed as ...
*/
function searchProducts() {
  search = [];
  let searchWord = searchInput.value;
  if (searchWord === '') {
    wiggleAnimation(searchButton);
  } else {
  let searchWordRE = new RegExp(searchWord, 'i');
  searching = true;
  for (let i = 0; i < data.length; i++) {
    const result = data[i].name.search(searchWordRE);
    if (result !== -1) {
      search.push(data[i]);
    }
  }
  const productOrProducts = (search.length === 1) ? 'product' : 'products';
  const searchWordSlice = searchWord.slice(0, 10);
  const searchWordLength = (searchWord.length <= 10) ? `<i>${searchWord}</i>` : `<i>${searchWordSlice}...</i>`;
  searchResult.innerHTML = `Searching for ${searchWordLength}`;
  const results = (search.length === 0) ? `No results ` : `Showing ${search.length} ${productOrProducts} `;
  searchText.innerHTML = results;
  const clear = '(<a id="clear">clear</a>)';
  searchText.innerHTML += clear;
  document.getElementById('clear').addEventListener('click', clearSearch);
  displayProducts();
  }
  searchInput.focus();
}

// Clears search and displays all products again
function clearSearch() {
  searching = false;
  searchText.innerHTML = 'Showing all products';
  searchResult.innerHTML = '';
  searchInput.value = '';
  displayProducts();
}

// Sorting products by name
sortByName.addEventListener('click', async () => {
  sortBy = '';
  sortByName.classList.add('selected');
  sortByPrice.classList.remove('selected');
  await getData();
  if (searching === true) {
    searchProducts();
  }
});

// Sorting products by price
sortByPrice.addEventListener('click', async () => {
  sortBy = 'price';
  sortByName.classList.remove('selected');
  sortByPrice.classList.add('selected');
  await getData();
  if (searching === true) {
    searchProducts();
  }
});