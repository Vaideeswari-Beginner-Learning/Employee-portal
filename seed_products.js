require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        const products = [
            {
                name: 'Dome Pro 4K Security Camera',
                description: 'Professional high-definition dome camera with 360° coverage. Features AI human detection and crystal clear night vision up to 30 meters.',
                shortDescription: 'Enterprise-Grade 4K UHD Dome Camera',
                category: 'Dome Cameras',
                price: 2999,
                availability: true,
                images: {
                    front: '/uploads/cctv_dome_front.png',
                    side: '/uploads/cctv_dome.png',
                    hero: '/uploads/cctv_hero_main.png'
                },
                technicalSpecs: [
                    { label: 'Resolution', value: '4K Ultra HD (3840 x 2160)' },
                    { label: 'Night Vision', value: 'IR up to 30m / Color Night Vision' },
                    { label: 'Field of View', value: '110° Wide Angle' },
                    { label: 'AI Features', value: 'Human & Vehicle Detection' }
                ],
                warranty: '2 Year Replacement Warranty',
                ratings: 4.9,
                compatibility: ['ONVIF', 'NVR', 'PoE']
            },
            {
                name: 'Bullet Guard X8 Outdoor',
                description: 'Rugged outdoor bullet camera designed for long-range surveillance. IP67 weather-resistant housing and superior motion tracking.',
                shortDescription: 'Long-Range Weatherproof Bullet Camera',
                category: 'Bullet Cameras',
                price: 3499,
                availability: true,
                images: {
                    front: '/uploads/cctv_bullet_front.png',
                    side: '/uploads/cctv_bullet_side.png',
                    back: '/uploads/cctv_dome.png'
                },
                technicalSpecs: [
                    { label: 'Resolution', value: '8MP / 4K UHD' },
                    { label: 'Optical Zoom', value: '5x Precision Zoom' },
                    { label: 'Protection', value: 'IP67 Waterproof / IK10' },
                    { label: 'Microphone', value: 'Built-in Audio Recording' }
                ],
                warranty: '3 Year Pro Care',
                ratings: 4.7,
                compatibility: ['E-Mount', 'SD UHS-II']
            },
            {
                name: 'PTZ Elite 360 Tracker',
                description: 'Full Pan-Tilt-Zoom capability with 100x digital zoom. Perfect for large parking lots, warehouses, and open areas.',
                shortDescription: '360° Pan-Tilt-Zoom Industrial Tracker',
                category: 'PTZ Cameras',
                price: 6499,
                availability: true,
                images: {
                    front: '/uploads/cctv_ptz_front.png',
                    side: '/uploads/cctv_ptz_side.png',
                    hero: '/uploads/cctv_hero_main.png'
                },
                technicalSpecs: [
                    { label: 'Movement', value: '360° Pan / 90° Tilt' },
                    { label: 'Zoom', value: '25x Optical / 100x Digital' },
                    { label: 'Tracking', value: 'Auto-Object Tracking' },
                    { label: 'Output', value: 'HDMI / SDI / IP' }
                ],
                warranty: '5 Year Service Contract',
                ratings: 4.8,
                compatibility: ['Universal Wall Mount', 'Joystick Controller']
            },
            {
                name: 'Wireless SK Node AI',
                description: 'Easy-install Wi-Fi security camera with battery backup. Perfect for homes and small offices with no wiring needed.',
                shortDescription: 'AI-Powered Wireless SK Node',
                category: 'Wireless Cameras',
                price: 1799,
                availability: true,
                images: {
                    front: '/uploads/cctv_dome_front.png',
                    side: '/uploads/cctv_dome.png',
                    hero: '/uploads/cctv_node_hero.png'
                },
                technicalSpecs: [
                    { label: 'Connectivity', value: 'Wi-Fi 6 / Bluetooth 5.0' },
                    { label: 'Battery', value: 'Up to 6 Months Charge' },
                    { label: 'Storage', value: 'MicroSD / Secure Cloud' },
                    { label: 'Audio', value: 'Two-Way Talk' },
                    { label: 'App', value: 'SK Technology App' }
                ],
                warranty: '1 Year Warranty',
                ratings: 4.6,
                compatibility: ['Google Home', 'Alexa', 'HomeKit']
            }
        ];

        await Product.insertMany(products);
        console.log('Successfully seeded', products.length, 'camera nodes');

        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedProducts();
