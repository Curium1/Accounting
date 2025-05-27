const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // Added axios

const prisma = new PrismaClient();
const BANKID_API_BASE_URL = process.env.BANKID_API_BASE_URL || 'https://appapi2.test.bankid.com/rp/v6.0';

// Function to generate JWT token
const generateToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET || 'DEFAULT_JWT_SECRET';
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: '30d',
  });
};

// Initiate BankID Authentication
const initiateBankIdSignup = async (req, res) => {
  // For now, using a placeholder for req.ip. In a real setup, ensure Express correctly parses req.ip.
  // Example: app.set('trust proxy', 1) if behind a reverse proxy.
  const endUserIp = req.ip || "127.0.0.1"; 
  // Placeholder for returnUrl, should be configurable or match your frontend callback.
  const returnUrl = process.env.BANKID_RETURN_URL || "https://your-frontend.example.com/bankid-callback";

  const payload = {
    endUserIp,
    returnUrl,
    // Additional parameters like 'requirement' can be added here if needed
    // e.g., requirement: { type: "CERTIFICATE_POLICIES", certificatePolicies: ["1.2.752.78.1.5"] } // Mobile BankID
  };

  console.log('Initiating BankID auth with payload:', JSON.stringify(payload, null, 2));

  try {
    const bankIdResponse = await axios.post(`${BANKID_API_BASE_URL}/auth`, payload, {
      headers: {
        'Content-Type': 'application/json',
      },
      // BankID test API might require specific TLS configuration for HTTPS client certificates
      // For the test API without client certs, this should be fine.
      // If using CA certificates for the BankID server:
      // httpsAgent: new https.Agent({ ca: fs.readFileSync('path/to/bankid_root_ca.pem') })
    });

    console.log('BankID API response status:', bankIdResponse.status);
    console.log('BankID API response data:', bankIdResponse.data);

    // Forward the success response from BankID to the client
    res.status(bankIdResponse.status).json(bankIdResponse.data);

  } catch (error) {
    console.error('Error during BankID auth initiation:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('BankID API Error Status:', error.response.status);
      console.error('BankID API Error Data:', error.response.data);
      // Forward BankID's error response to the client
      res.status(error.response.status).json(error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('BankID API No Response:', error.request);
      res.status(500).json({ message: 'No response from BankID service.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('BankID API Request Setup Error:', error.message);
      res.status(500).json({ message: 'Server error setting up BankID request.' });
    }
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
