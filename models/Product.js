const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        default: 0
    },
    availability: {
        type: Boolean,
        default: true
    },
    images: {
        front: { type: String },
        back: { type: String },
        side: { type: String },
        hero: { type: String },
        top: { type: String }
    },
    specifications: {
        type: Map,
        of: String
    },
    technicalSpecs: [{
        label: { type: String },
        value: { type: String }
    }],
    warranty: {
        type: String
    },
    ratings: {
        type: Number,
        default: 5,
        min: 0,
        max: 5
    },
    compatibility: {
        type: [String]
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
