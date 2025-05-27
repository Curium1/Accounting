// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client'); // Adjust path if your client instance is elsewhere

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Ensure JWT_SECRET is in your .env

      // Fetch user by ID from token, excluding password
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, username: true, createdAt: true, updatedAt: true }
      });

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }
      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
