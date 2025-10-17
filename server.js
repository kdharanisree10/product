const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

// Middleware to parse JSON
app.use(express.json());

// Path to products.json
const filePath = path.join(__dirname, 'products.json');

// Utility function to read data from file
function readProducts() {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, '[]'); // Create empty file if not exists
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error('Error reading file:', error);
    return [];
  }
}

// Utility function to write data to file
function writeProducts(products) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
  } catch (error) {
    console.error('Error writing file:', error);
  }
}

// --------------------- ROUTES ----------------------

// ✅ GET /products → return all products
app.get('/products', (req, res) => {
  const products = readProducts();
  res.json(products);
});

// ✅ BONUS: GET /products/instock → return only products in stock
app.get('/products/instock', (req, res) => {
  const products = readProducts();
  const inStockProducts = products.filter(p => p.inStock === true);
  res.json(inStockProducts);
});

// ✅ POST /products → add new product
app.post('/products', (req, res) => {
  const { name, price, inStock } = req.body;

  if (!name || typeof price !== 'number' || typeof inStock !== 'boolean') {
    return res.status(400).json({ error: 'Invalid input format' });
  }

  const products = readProducts();
  const newId = products.length > 0 ? products[products.length - 1].id + 1 : 1;
  const newProduct = { id: newId, name, price, inStock };

  products.push(newProduct);
  writeProducts(products);
  res.status(201).json(newProduct);
});

// ✅ PUT /products/:id → update existing product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, inStock } = req.body;
  const products = readProducts();
  const index = products.findIndex(p => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  // Update fields if provided
  if (name !== undefined) products[index].name = name;
  if (price !== undefined) products[index].price = price;
  if (inStock !== undefined) products[index].inStock = inStock;

  writeProducts(products);
  res.json(products[index]);
});

// ✅ DELETE /products/:id → remove product
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const products = readProducts();
  const index = products.findIndex(p => p.id === parseInt(id));

  if (index === -1) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const removed = products.splice(index, 1);
  writeProducts(products);
  res.json({ message: `Product with id ${id} deleted successfully`, deleted: removed[0] });
});

// ----------------------------------------------------

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});