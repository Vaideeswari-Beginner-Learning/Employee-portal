const mongoose = require('mongoose');
const Order = require('./models/Order');
const Product = require('./models/Product');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedOrders = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing orders
        await Order.deleteMany({});
        console.log('Cleared existing orders');

        const products = await Product.find();
        const customer = await User.findOne({ role: 'customer' });

        if (!products.length || !customer) {
            console.log('Missing products or customer to seed orders');
            process.exit(0);
        }

        const orders = [
            {
                orderId: 'ORD-2024-001',
                customer: customer._id,
                products: [
                    { product: products[0]._id, quantity: 1, priceAtPurchase: products[0].price },
                    { product: products[1]._id, quantity: 2, priceAtPurchase: products[1].price }
                ],
                totalAmount: products[0].price + (products[1].price * 2),
                status: 'Delivered',
                paymentStatus: 'Paid',
                shippingAddress: {
                    street: '123 Tech Lane',
                    city: 'Innovation City',
                    state: 'CA',
                    zip: '94043',
                    country: 'USA'
                }
            },
            {
                orderId: 'ORD-2024-002',
                customer: customer._id,
                products: [
                    { product: products[2]._id, quantity: 1, priceAtPurchase: products[2].price }
                ],
                totalAmount: products[2].price,
                status: 'Shipped',
                paymentStatus: 'Paid',
                shippingAddress: {
                    street: '456 Cyber St',
                    city: 'Future Town',
                    state: 'NY',
                    zip: '10001',
                    country: 'USA'
                }
            },
            {
                orderId: 'ORD-2024-003',
                customer: customer._id,
                products: [
                    { product: products[3]._id, quantity: 1, priceAtPurchase: products[3].price }
                ],
                totalAmount: products[3].price,
                status: 'Processing',
                paymentStatus: 'Paid',
                shippingAddress: {
                    street: '789 Signal Rd',
                    city: 'Data Village',
                    state: 'TX',
                    zip: '75001',
                    country: 'USA'
                }
            },
            {
                orderId: 'ORD-2024-004',
                customer: customer._id,
                products: [
                    { product: products[4]._id, quantity: 1, priceAtPurchase: products[4].price }
                ],
                totalAmount: products[4].price,
                status: 'Pending',
                paymentStatus: 'Pending',
                shippingAddress: {
                    street: '101 Cloud Way',
                    city: 'Sky City',
                    state: 'WA',
                    zip: '98001',
                    country: 'USA'
                }
            }
        ];

        await Order.insertMany(orders);
        console.log('Successfully seeded 4 orders');

        process.exit(0);
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedOrders();
