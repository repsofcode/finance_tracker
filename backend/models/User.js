
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,           
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'], 
  },
  password: {
    type: String,
    required: true,
    minlength: 8,         
    select: false,         
  },
  monthlyBudget: {
    type: Number,
    default: 0,
  },
  refreshTokens: [
    {
      token: { type: String, required: true },
      expiresAt: { type: Date, required: true },
    },
  ],
}, { timestamps: true });


userSchema.pre('save', async function (next) {
 
  if (!this.isModified('password')) {
    return next();
  }

  
  try {
    const salt = await bcrypt.genSalt(12);                  
    this.password = await bcrypt.hash(this.password, salt); 
    next();                                                 
  } catch (err) {
    next(err); 
  }
});

// Custom method you can call on any user document
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
  // returns true/false — safe against timing attacks
};

module.exports = mongoose.model('User', userSchema);
