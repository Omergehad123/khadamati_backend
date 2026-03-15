const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const WorkerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    jobType: {
        type: String,
        required: [true, 'Please specify a job type (e.g., Plumber, Carpenter)']
    },
    category: {
        type: String,
        required: [true, 'Please specify a category'],
        enum: ['Worker', 'Doctor', 'Engineer']
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    city: {
        type: String,
        required: [true, 'Please specify a city']
    },
    area: {
        type: String,
        required: [true, 'Please specify an area']
    },
    address: String,
    description: String,
    experienceYears: {
        type: Number,
        default: 0
    },
    services: [String],
    images: [String],
    reviews: [{
        reviewerName: {
            type: String,
            required: [true, 'Please add your name']
        },
        reviewerEmail: {
            type: String,
            required: [true, 'Please add your email'],
            match: [
                /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                'Please add a valid email'
            ]
        },
        rating: {
            type: Number,
            required: [true, 'Please add a rating between 1 and 5'],
            min: 1,
            max: 5
        },
        comment: {
            type: String,
            required: [true, 'Please add a comment']
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    averageRating: {
        type: Number,
        default: 0
    },
    numOfReviews: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
WorkerSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return;
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
WorkerSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// Match user entered password to hashed password in database
WorkerSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Worker', WorkerSchema);
