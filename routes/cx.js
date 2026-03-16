const express = require('express');
const router = express.Router();
const { auth, adminAuth, managerAuth } = require('../middleware/auth');
const Product = require('../models/Product');
const ServiceRequest = require('../models/ServiceRequest');
const Announcement = require('../models/Announcement');

// --- Product Routes ---

// @desc    Get all products with filters
// @route   GET /api/cx/products
router.get('/products', async (req, res) => {
    try {
        const { category, priceMin, priceMax, ratings, search } = req.query;
        let query = {};

        if (category) query.category = category;
        if (priceMin || priceMax) {
            query.price = {};
            if (priceMin) query.price.$gte = Number(priceMin);
            if (priceMax) query.price.$lte = Number(priceMax);
        }
        if (ratings) query.ratings = { $gte: Number(ratings) };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const products = await Product.find(query);
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Get single product details
// @route   GET /api/cx/products/:id
router.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Service Request Routes ---

// @desc    Book a new service
// @route   POST /api/cx/book
router.post('/book', async (req, res) => {
    try {
        const { customerName, contactDetails, preferredDate, preferredTimeSlot, productType, description } = req.body;
        
        const newRequest = new ServiceRequest({
            customerName,
            contactDetails,
            preferredDate,
            preferredTimeSlot,
            productType,
            description
        });

        const savedRequest = await newRequest.save();
        res.status(201).json(savedRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// @desc    Track a service request
// @route   GET /api/cx/track/:requestId
router.get('/track/:requestId', async (req, res) => {
    try {
        const request = await ServiceRequest.findOne({ requestId: req.params.requestId })
            .populate('assignedEmployee', 'name email');
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- Admin CX Routes ---

// @desc    Get all service requests (Admin/Manager only)
// @route   GET /api/cx/admin/requests
router.get('/admin/requests', managerAuth, async (req, res) => {
    try {
        const requests = await ServiceRequest.find()
            .sort({ createdAt: -1 })
            .populate('assignedEmployee', 'name email role');
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// @desc    Update request status or assign employee
// @route   PATCH /api/cx/admin/requests/:id
router.patch('/admin/requests/:id', managerAuth, async (req, res) => {
    try {
        const { status, assignedEmployee } = req.body;
        const request = await ServiceRequest.findById(req.params.id);
        
        if (!request) return res.status(404).json({ message: 'Request not found' });
        
        const oldAssignee = request.assignedEmployee;

        if (status) request.status = status;
        if (assignedEmployee) request.assignedEmployee = assignedEmployee;
        
        const updatedRequest = await request.save();

        if (assignedEmployee && String(oldAssignee) !== String(assignedEmployee)) {
            try {
                await Announcement.create({
                    title: 'New Service Protocol Assigned',
                    content: `You have been assigned to Service Request ${updatedRequest.requestId} for ${updatedRequest.customerName}.`,
                    category: 'Urgent',
                    priority: 'High',
                    createdBy: req.user._id
                });
            } catch (notifyErr) {
                console.error("Failed to trigger assignment notification:", notifyErr);
            }
        }

        res.json(updatedRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
