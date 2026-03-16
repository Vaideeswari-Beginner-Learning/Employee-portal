const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String, required: false, default: '' },
    role: { type: String, enum: ['admin', 'manager', 'employee', 'customer'], default: 'customer' },
    profilePhoto: { type: String, default: '' },
    employeeId: { type: String, unique: true, sparse: true },
    expertise: [{ type: String, enum: ['Service', 'Maintenance', 'Installation', 'Inspection'], default: [] }],
    performanceRating: { type: Number, default: 0 },
    performanceReviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PerformanceReview' }],
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
