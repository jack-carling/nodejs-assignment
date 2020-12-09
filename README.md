# Inlämningsuppgift 1

**Info**

Node.JS-applikation för en e-handelssida.

**Endpoints**
* /api/products
* /api/cart

**Methods**
* **GET** - /api/products - hämtar alla produkter från databasen
    * Query *sortby* kan användas för att sortera efter *price* - /api/products?sortby=price
    * Utan query, eller med felinmatad query kommer den retunera alla efter hur de ligger i databasen
* **GET** - /api/cart - hämtar alla produkter placerade i varukorgen
* **POST** - /api/cart - lägg till produkt i varukorg
    * Query *id* (krävs) - skicka tillbaka samma id som hämtades från products för att lägga till i varukorg
    * T.ex. /api/cart?id=3
    * Felmeddelanden:
        * ID is not a number or missing | ID:et skickades inte med eller är felformaterat
        * Item does not exist | ID:et saknas i databasen, alltså finns ingen produkt med det ID:et
        * Item already in cart | Produkten finns redan i varukorgen, kan inte läggas till fler än 1 gång
        * Returnerar success: false vid fel
    * Item added to cart | success: true | Allting gick som det ska
* **DELETE** - /api/cart - tar bort produkt från varukorg
    * Query *id* (krävs) - skicka tillbaka samma id som hämtades från products för att ta bort från varukorg
    * T.ex. /api/cart?id=3
    * Felmeddelanden:
        * ID is not a number or missing | ID:et skickades inte med eller är felformaterat
        * Item is not in cart | Produkten finns inte i varukorgen och kan inte tas bort
        * Returnerar success: false vid fel
    * Item has been removed from cart | success: true | Allting gick som det ska
* **PUT** - /api/cart - uppdaterar *count* i produkt i varukorgen - alltså antalet av en produkt som ska köpas
    * Query *id* + query *count* (krävs båda) - för att öka/minska antalet av en produkt
    * T.ex. /api/cart/?id=17&count=37 - ändrar count i produkten med id 17 till 37
    * T.ex. /api/cart/?id=9&count=1 - ändrar count i produkten med id 9 till 1 (lägsta)
    * Fungerar endast med heltal mellan 1-99, färre än 1 och fler än 99 av samma produkt går inte att ha i varukorgen
    * Felmeddelanden:
        * Error: ID and/or count is not a number or missing | ID:et och/eller count skickades inte med eller är felformaterat
        * Item is not in cart | Produkten finns inte i varukorgen och kan inte ändras
        * Count is not an integer | Count måste vara ett tal utan decimaler
        * Count can only be between 1-99 | Count måste vara ett tal mellan 1-99
        * Returnerar success: false vid fel
    * Item count altered | success: true | Allting gick som det ska