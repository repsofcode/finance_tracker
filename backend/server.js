
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { register }    = require('./controllers/register');
const { login }       = require('./controllers/login');
const { refresh }     = require('./controllers/authController');
const { updateBudget }= require('./controllers/updatebudgetcontroller');
const { getSummary }  = require('./controllers/summarybudgetcontroller');

const authMiddleware  = require('./middleware/auth');


const Expense = require('./models/Expense');


const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,   
}));
app.use(express.json());
app.use(cookieParser());   

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});


app.post('/api/auth/register', register);
app.post('/api/auth/login',    login);
app.post('/api/auth/refresh',  refresh);  


app.post('/api/auth/logout', authMiddleware, async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
     
      const User = require('./models/User');
      await User.findByIdAndUpdate(req.user.id, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    }

    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Server error during logout' });
  }
});


app.put('/api/budget',         authMiddleware, updateBudget);   // set/update monthly budget
app.get('/api/budget/summary', authMiddleware, getSummary);     // ?month=YYYY-MM (optional)


app.get('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const { month, category, page = 1, limit = 20 } = req.query;
    const filter = { userId: req.user.id };

    
    if (month) {
      const [year, mon] = month.split('-').map(Number);
      if (isNaN(year) || isNaN(mon) || mon < 1 || mon > 12) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      }
      filter.date = {
        $gte: new Date(year, mon - 1, 1),
        $lte: new Date(year, mon, 0, 23, 59, 59, 999),
      };
    }

   
    if (category) {
      filter.category = { $regex: new RegExp(category, 'i') };
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Expense.countDocuments(filter);

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      expenses,
      pagination: {
        total,
        page:       Number(page),
        limit:      Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
});


app.post('/api/expenses', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (!amount || !category || !date) {
      return res.status(400).json({ error: 'Amount, category, and date are required' });
    }
    if (typeof amount !== 'number' || amount < 0) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }

    const expense = new Expense({
      userId: req.user.id,
      amount,
      category: category.trim(),
      description: description?.trim(),
      date: new Date(date),
    });

    await expense.save();
    res.status(201).json({ message: 'Expense added successfully', expense });
  } catch (error) {
    console.error('Add expense error:', error);
    res.status(500).json({ error: 'Server error adding expense' });
  }
});


app.get('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id:    req.params.id,
      userId: req.user.id,    
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ expense });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({ error: 'Server error fetching expense' });
  }
});


app.put('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;

    if (amount !== undefined && (typeof amount !== 'number' || amount < 0)) {
      return res.status(400).json({ error: 'Amount must be a non-negative number' });
    }

    const updates = {};
    if (amount      !== undefined) updates.amount      = amount;
    if (category    !== undefined) updates.category    = category.trim();
    if (description !== undefined) updates.description = description.trim();
    if (date        !== undefined) updates.date        = new Date(date);

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Server error updating expense' });
  }
});

// DELETE 
app.delete('/api/expenses/:id', authMiddleware, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id:    req.params.id,
      userId: req.user.id,
    });

    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Server error deleting expense' });
  }
});


app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'An unexpected error occurred' });
});


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
