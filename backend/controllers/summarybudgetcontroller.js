const Expense = require('../models/Expense');
const User = require('../models/User');
const mongoose = require('mongoose');

exports.getSummary = async (req, res) => {
  try {
    const { month } = req.query; 
    let year, mon;
    if (month) {
      [year, mon] = month.split('-').map(Number);
      if (isNaN(year) || isNaN(mon) || mon < 1 || mon > 12) {
        return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
      }
    } else {
      const now = new Date();
      year = now.getFullYear();
      mon = now.getMonth() + 1; 
    }

    
    const startOfMonth = new Date(year, mon - 1, 1);
    const endOfMonth = new Date(year, mon, 0, 23, 59, 59, 999);

    
    const user = await User.findById(req.user.id).select('monthlyBudget name email');
    const budget = user?.monthlyBudget || 0;

    
    const aggResult = await Expense.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(req.user.id),
          date: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: '$amount' }
        }
      }
    ]);

    const totalExpenses = aggResult.length > 0 ? aggResult[0].totalExpenses : 0;

    
    const remaining = budget - totalExpenses;

    let status;
    if (remaining >= budget * 0.3) {
      status = 'Comfortable';
    } else if (remaining >= budget * 0.1) {
      status = 'Tight';
    } else if (remaining >= 0) {
      status = 'Difficult';
    } else {
      status = 'Overspending';
    }


    const monthStr = `${year}-${String(mon).padStart(2, '0')}`;


    res.status(200).json({
      month: monthStr,
      budget,
      totalExpenses,
      remaining,
      status,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ error: 'Server error generating summary' });
  }
};
