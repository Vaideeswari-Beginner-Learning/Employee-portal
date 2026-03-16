const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const products = [
    {
        name: "Pro-Lite Dome Node",
        category: "Dome Cameras",
        price: 2499,
        shortDescription: "Sleek indoor surveillance with 4K clarity and AI human detection.",
        description: "The Pro-Lite Dome Node is designed for premium indoor environments. Featuring a 4MP sensor, it delivers crystal clear footage with wide-angle coverage. Integrated AI algorithms distinguish between humans and pets, reducing false alerts by 95%.",
        availability: true,
        images: {
            front: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&q=80&w=800",
            back: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800",
            side: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800"
        },
        technicalSpecs: [
            { label: "Resolution", value: "4MP (2560 x 1440)" },
            { label: "Night Vision", value: "30m IR Range" },
            { label: "Storage", value: "MicroSD up to 256GB" },
            { label: "Connectivity", value: "PoE / Wi-Fi 6" }
        ]
    },
    {
        name: "Guardian Bullet X8",
        category: "Bullet Cameras",
        price: 3899,
        shortDescription: "Ultra-rugged 8K outdoor terminal with thermal scanning.",
        description: "Built for the toughest conditions, the Guardian Bullet X8 features an IP67-rated enclosure. Its 8K sensor provides unparalleled detail, while the advanced thermal sensor allows for perimeter protection even in dense fog or smoke.",
        availability: true,
        images: {
            front: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=800",
            back: "https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?auto=format&fit=crop&q=80&w=800",
            side: "https://images.unsplash.com/photo-1580894894513-541e068a3e2b?auto=format&fit=crop&q=80&w=800"
        },
        technicalSpecs: [
            { label: "Resolution", value: "8K Ultra HD" },
            { label: "Weatherproof", value: "IP67 Rated" },
            { label: "Zoom", value: "10x Optical Zoom" },
            { label: "Audio", value: "Two-way Intercom" }
        ]
    },
    {
        name: "Horizon PTZ Maverick",
        category: "PTZ Cameras",
        price: 12499,
        shortDescription: "Self-rotating tracking node with 100x hybrid zoom.",
        description: "The Horizon PTZ Maverick is the ultimate surveillance powerhouse. With 360-degree continuous rotation and a 100x hybrid zoom, no detail escaped its gaze. AI-powered auto-tracking maintains focus on moving targets automatically.",
        availability: true,
        images: {
            front: "https://images.unsplash.com/photo-1610056494052-6a4f83a8368c?auto=format&fit=crop&q=80&w=800",
            back: "https://images.unsplash.com/photo-1557862921-37829c790f19?auto=format&fit=crop&q=80&w=800",
            side: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&q=80&w=800"
        },
        technicalSpecs: [
            { label: "Rotation", value: "360° Endless Pan" },
            { label: "Zoom", value: "100x Hybrid (40x Optical)" },
            { label: "Tracking", value: "AI Auto-Targeting" },
            { label: "Power", value: "Hi-PoE Support" }
        ]
    },
    {
        name: "Stealth Mini Wireless",
        category: "Wireless Cameras",
        price: 1999,
        shortDescription: "Completely wire-free node with 12-month battery life.",
        description: "Perfect for hidden monitoring, the Stealth Mini is zero-wire and zero-hassle. Its massive internal battery lasts up to a year on a single charge. Installs in seconds with the included magnetic mount.",
        availability: true,
        images: {
            front: "https://images.unsplash.com/photo-1559828913-9118c7c9ec92?auto=format&fit=crop&q=80&w=800",
            back: "https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&q=80&w=800",
            side: "https://images.unsplash.com/photo-1582139329536-e72e88a0026e?auto=format&fit=crop&q=80&w=800"
        },
        technicalSpecs: [
            { label: "Battery", value: "10,000mAh (12 Months)" },
            { label: "Angle", value: "160° Ultra-Wide" },
            { label: "Cloud", value: "Free 7-Day Storage" },
            { label: "Size", value: "Pocket Format" }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-portal');
        console.log('Connected to Database');
        
        await Product.deleteMany({});
        console.log('Cleared existing products');
        
        await Product.insertMany(products);
        console.log('CCTV Data Seeded Successfully');
        
        mongoose.connection.close();
    } catch (err) {
        console.error('Seed Error:', err);
        process.exit(1);
    }
};

seedDB();
