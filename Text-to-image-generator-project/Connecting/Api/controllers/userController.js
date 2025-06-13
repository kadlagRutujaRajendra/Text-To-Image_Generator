const collection = require('../models/logschema');

const getCurrentUser = async (req, res) => {
  try {
    const user = await collection.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getCurrentUser };
