const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// Function to generate JWT token
const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'DEFAULT_JWT_SECRET';
  // Note: Using 'DEFAULT_JWT_SECRET' if process.env.JWT_SECRET is not set. 
  // This should be configured properly in a production environment.
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d', // Token expires in 30 days
  });
};

// Initiate BankID Signup (mocked response)
const initiateBankIdSignup = async (req, res) => {
  try {
    // In a real scenario, this would involve interaction with the BankID service.
    // For this task, we return a mocked response.
    res.status(200).json({
      name: "Test Testsson",
      socialSecurityNumber: "19900101-1234"
    });
  } catch (error) {
    console.error('Error in initiateBankIdSignup:', error);
    res.status(500).json({ message: 'Server error during BankID initiation' });
  }
};

// Complete BankID Signup
const completeBankIdSignup = async (req, res) => {
  const { name, socialSecurityNumber, email, password } = req.body;

  // Validate input
  if (!name || !socialSecurityNumber || !email || !password) {
    return res.status(400).json({ message: 'All fields are required: name, socialSecurityNumber, email, password' });
  }

  try {
    // Check if user already exists with the given socialSecurityNumber or email
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { socialSecurityNumber: socialSecurityNumber },
          { email: email },
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this SSN or email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        socialSecurityNumber,
        email,
        password: hashedPassword,
      },
    });

    // Respond with user data and token
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } catch (error) {
    console.error('Error in completeBankIdSignup:', error);
    if (error.code === 'P2002') { // Prisma unique constraint violation
        return res.status(400).json({ message: `User with this ${error.meta.target.join(', ')} already exists.` });
    }
    res.status(500).json({ message: 'Server error during BankID signup completion' });
  }
};

module.exports = {
  initiateBankIdSignup,
  completeBankIdSignup,
  // Export generateToken if it were to be used by other controllers,
  // but for now it's internal to this controller.
};
