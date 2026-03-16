const express = require('express');
const router = express.Router();
const { auth, adminAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const Order = require('../models/Order');
const InstallationRequest = require('../models/InstallationRequest');

// --- E-Commerce Public Routes ---

// @desc    Get all available e-commerce products
// @route   GET /api/shop/products
router.get('/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { shortDescription: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get single product details
// @route   GET /api/shop/products/:id
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- E-Commerce Protected Routes (Cart, Orders, Installations) ---

// @desc    Place a new Order
// @route   POST /api/shop/order
router.post('/order', auth, async (req, res) => {
    try {
        const { products, totalAmount, shippingAddress } = req.body;
        
        // Basic order validation (detailed validation can be expanded)
        if (!products || products.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        // Generate Order ID
        const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

        const newOrder = new Order({
            orderId,
            customer: req.user._id, // Set correctly by auth middleware
            products,
            totalAmount,
            shippingAddress,
            status: 'Pending',
            paymentStatus: 'Pending'
        });

        const savedOrder = await newOrder.save();

        // Optionally decrement stock levels here using savedOrder data
        for (const item of products) {
            await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity } });
        }

        res.status(201).json(savedOrder);
    } catch (err) {
        console.error('Order placement error:', err);
        res.status(400).json({ message: err.message });
    }
});

// @desc    Get Customer's Orders
// @route   GET /api/shop/orders
router.get('/orders', auth, async (req, res) => {
    try {
        const orders = await Order.find({ customer: req.user._id })
            .populate('products.product', 'name price images')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Submit an Installation Request
// @route   POST /api/shop/installation
router.post('/installation', async (req, res) => {
    try {
        const { customerName, phone, location, numberOfCameras, installationType } = req.body;
        
        const newRequest = new InstallationRequest({
            customerName,
            phone,
            location,
            numberOfCameras,
            installationType
        }); // Status will default to Pending, requestID is auto-generated

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        console.error('Installation request error:', err);
        res.status(400).json({ message: err.message });
    }
});

// --- E-Commerce Administrative Routes ---

// @desc    Get all products (Admin)
// @route   GET /api/shop/admin/products
router.get('/admin/products', adminAuth, async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Add a new product
// @route   POST /api/shop/admin/products
router.post('/admin/products', adminAuth, async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Update a product
// @route   PATCH /api/shop/admin/products/:id
router.patch('/admin/products/:id', adminAuth, async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Delete a product
// @route   DELETE /api/shop/admin/products/:id
router.delete('/admin/products/:id', adminAuth, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get all orders (Admin)
// @route   GET /api/shop/admin/orders
router.get('/admin/orders', adminAuth, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('customer', 'name email')
            .populate('products.product', 'name')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Update order status
// @route   PATCH /api/shop/admin/orders/:id
router.patch('/admin/orders/:id', adminAuth, async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(updatedOrder);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Get all installation requests (Admin)
// @route   GET /api/shop/admin/installations
router.get('/admin/installations', adminAuth, async (req, res) => {
    try {
        const requests = await InstallationRequest.find()
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Update installation request status
// @route   PATCH /api/shop/admin/installations/:id
router.patch('/admin/installations/:id', adminAuth, async (req, res) => {
    try {
        const updatedRequest = await InstallationRequest.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
