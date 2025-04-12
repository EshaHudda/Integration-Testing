// app.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// MongoDB Connection URL
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/integration-test-db'; // Added default

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    //  IMPORTANT:  Exit if database connection fails.  This prevents the app
    //  from running without a database, which would cause other errors.
    process.exit(1);
  });

// Define a simple schema and model for a product
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
});
const Product = mongoose.model('Product', productSchema);

// API Routes

// Create a new product
app.post('/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Get all products
app.get('/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve products' });
  }
});

// Get a single product by ID
app.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
     if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid product ID' }); // Handle invalid IDs
      }
    res.status(500).json({ error: 'Failed to retrieve product' });
  }
});

// Update a product by ID
app.put('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
     if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid product ID' }); // Handle invalid IDs
      }
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete a product by ID
app.delete('/products/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (err) {
     if (err.name === 'CastError') {
        return res.status(400).json({ error: 'Invalid product ID' }); // Handle invalid IDs
      }
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to the Integration Test API!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
