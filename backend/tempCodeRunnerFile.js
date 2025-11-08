const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock products (5–10 items)
const products = [
  { id: 1, name: "T-Shirt", price: 299 },
  { id: 2, name: "Jeans", price: 799 },
  { id: 3, name: "Shoes", price: 1599 },
  { id: 4, name: "Watch", price: 899 },
  { id: 5, name: "Cap", price: 199 }
];

let cart = []; // simple memory cart

// 🛍 GET all products
app.get('/api/products', (req, res) => {
  res.json(products);
});

// ➕ POST add item to cart
app.post('/api/cart', (req, res) => {
  const { productId, qty } = req.body;
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: "Product not found" });
  
  const cartItem = { id: Date.now(), productId, qty };
  cart.push(cartItem);
  res.status(201).json(cartItem);
});

// ❌ DELETE remove item from cart
app.delete('/api/cart/:id', (req, res) => {
  const id = Number(req.params.id);
  cart = cart.filter(item => item.id !== id);
  res.status(204).send();
});

// 🛒 GET cart with total
app.get('/api/cart', (req, res) => {
  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      name: product.name,
      price: product.price,
      subtotal: product.price * item.qty
    };
  });
  const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  res.json({ cartItems, total });
});

// 💳 POST checkout
app.post('/api/checkout', (req, res) => {
  const { cartItems, name, email } = req.body;
  if (!cartItems || !name || !email) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const receipt = {
    name,
    email,
    total,
    timestamp: new Date().toISOString()
  };
  cart = []; // clear cart after checkout
  res.json(receipt);
});

// 🚀 Start server
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
